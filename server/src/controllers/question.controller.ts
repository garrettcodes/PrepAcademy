import { Request, Response } from 'express';
import Question from '../models/question.model';
import PerformanceData from '../models/performanceData.model';
import User from '../models/user.model';
import { checkBadgeEligibility } from './badge.controller';
import mongoose from 'mongoose';

// Helper to convert string ID to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Get practice questions
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, difficulty, format, limit = 10 } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (format) filter.format = format;

    // Get questions based on filter
    const questions = await Question.find(filter).limit(Number(limit));

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found matching the criteria' });
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit answer for a question
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, selectedAnswer, timeSpent } = req.body;
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if answer is correct
    const isCorrect = question.correctAnswer === selectedAnswer;
    
    // Calculate score (100 if correct, 0 if incorrect)
    const score = isCorrect ? 100 : 0;

    // Award points to the user if the answer is correct
    if (isCorrect) {
      await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
    }

    // Save performance data
    const performanceData = await PerformanceData.create({
      userId,
      subject: question.subject,
      subtopic: question.subject, // Using subject as subtopic for now
      score,
      studyTime: timeSpent || 0,
      date: new Date(),
    });

    // Check for badge eligibility
    const earnedBadges = await checkBadgeEligibility(userId, question.subject, score);

    // Get appropriate explanation based on user's learning style
    // Fetch complete user data from database to get learningStyle
    const userData = await User.findById(userId);
    let explanation = question.explanations.text; // Default to text explanation
    
    if (userData?.learningStyle && question.explanations[userData.learningStyle]) {
      explanation = question.explanations[userData.learningStyle];
    }

    // Get next hint if answer is incorrect
    let hint: string | null = null;
    if (!isCorrect && question.hints && question.hints.length > 0) {
      hint = question.hints[0]; // Just get the first hint for simplicity
    }

    // Get similar questions for additional practice if answer is incorrect
    let similarQuestions: any[] = [];
    if (!isCorrect) {
      similarQuestions = await Question.find({
        _id: { $ne: questionId },
        subject: question.subject,
        difficulty: question.difficulty
      }).limit(3);
    }

    res.status(200).json({
      isCorrect,
      score,
      explanation,
      hint,
      similarQuestions,
      performanceData,
      earnedBadges: earnedBadges || []
    });
  } catch (error: any) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new question (admin only)
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const {
      text,
      options,
      correctAnswer,
      subject,
      difficulty,
      format,
      hints,
      explanations,
    } = req.body;

    // Create new question
    const question = await Question.create({
      text,
      options,
      correctAnswer,
      subject,
      difficulty: difficulty || 'medium',
      format: format || 'text',
      hints: hints || [],
      explanations: explanations || {},
    });

    res.status(201).json(question);
  } catch (error: any) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a hint for a question
export const getQuestionHint = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { hintIndex = 0 } = req.query;
    
    // Get the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if question has hints
    if (!question.hints || question.hints.length === 0) {
      return res.status(404).json({ message: 'No hints available for this question' });
    }

    // Get the requested hint or the last available one if index is out of bounds
    const index = Math.min(Number(hintIndex), question.hints.length - 1);
    const hint = question.hints[index];

    // =====================================================
    // FUTURE AI INTEGRATION POINT
    // =====================================================
    // Replace the static hint retrieval with AI-generated hint
    // Example:
    // 
    // const aiHint = await openai.createCompletion({
    //   model: "gpt-3.5-turbo",
    //   prompt: `Generate a helpful hint for this question: ${question.text}. 
    //            The correct answer is: ${question.correctAnswer}.
    //            Make the hint subtle but useful.`,
    //   max_tokens: 100,
    // });
    // 
    // return res.status(200).json({ hint: aiHint.choices[0].text });
    // =====================================================

    res.status(200).json({ hint, index });
  } catch (error: any) {
    console.error('Get hint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get an explanation for a question
export const getQuestionExplanation = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { learningStyle = 'text' } = req.query;
    
    // Get the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if question has explanations
    if (!question.explanations) {
      return res.status(404).json({ message: 'No explanations available for this question' });
    }

    // Get the explanation for the requested learning style or fallback to text
    let explanation = question.explanations[learningStyle as keyof typeof question.explanations];
    
    if (!explanation && learningStyle !== 'text') {
      explanation = question.explanations.text;
    }

    if (!explanation) {
      return res.status(404).json({ message: 'No explanation available for the requested learning style' });
    }

    // =====================================================
    // FUTURE AI INTEGRATION POINT
    // =====================================================
    // Replace the static explanation retrieval with AI-generated explanation
    // Example:
    // 
    // const aiExplanation = await openai.createCompletion({
    //   model: "gpt-3.5-turbo",
    //   prompt: `Generate a detailed explanation for this question: ${question.text}. 
    //            The correct answer is: ${question.correctAnswer}.
    //            Format the explanation for a ${learningStyle} learner.
    //            For visual learners, include descriptive imagery.
    //            For auditory learners, use sound analogies and verbal explanations.
    //            For kinesthetic learners, use physical analogies and real-world examples.
    //            For text learners, provide a clear, concise textual explanation.`,
    //   max_tokens: 300,
    // });
    // 
    // return res.status(200).json({ explanation: aiExplanation.choices[0].text });
    // =====================================================

    res.status(200).json({ explanation });
  } catch (error: any) {
    console.error('Get explanation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get practice questions for trial users (limited questions)
export const getPracticeQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, difficulty, format } = req.query;
    const limit = 5; // Trial users are limited to 5 questions

    // Build filter object
    const filter: any = {};
    
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (format) filter.format = format;

    // Get questions based on filter
    const questions = await Question.find(filter).limit(limit);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found matching the criteria' });
    }

    // Remove correct answers from the questions for security
    const sanitizedQuestions = questions.map(question => {
      const { correctAnswer, ...sanitizedQuestion } = question.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      questions: sanitizedQuestions,
      message: 'For unlimited questions, upgrade to a premium subscription',
      limit
    });
  } catch (error: any) {
    console.error('Get practice questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific question by ID
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    // Find the question by ID
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove correct answer from question
    const { correctAnswer, ...sanitizedQuestion } = question.toObject();

    res.status(200).json(sanitizedQuestion);
  } catch (error: any) {
    console.error('Get question by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unlimited questions for paid subscribers
export const getUnlimitedQuestions = async (req: Request, res: Response) => {
  try {
    const { subject, difficulty, format, limit = 20 } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (format) filter.format = format;

    // Get questions based on filter
    const questions = await Question.find(filter).limit(Number(limit));

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found matching the criteria' });
    }

    // Remove correct answers from the questions for security
    const sanitizedQuestions = questions.map(question => {
      const { correctAnswer, ...sanitizedQuestion } = question.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      questions: sanitizedQuestions,
      count: sanitizedQuestions.length
    });
  } catch (error: any) {
    console.error('Get unlimited questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed question analytics
export const getQuestionAnalytics = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get performance data for the user
    const performanceData = await PerformanceData.find({ userId });

    // Map question IDs to their performance data
    const questionPerformance: Record<string, { 
      correct: number; 
      total: number; 
      averageTime: number;
      lastAttempt: Date;
    }> = {};

    // Analyze performance for each question
    // Note: This assumes performance data includes question-specific info
    // You may need to modify this based on your actual data schema
    for (const data of performanceData) {
      // This is a simplified example - adapt to your actual schema
      if (data.subtopic && data.subtopic.includes('question:')) {
        const questionId = data.subtopic.split('question:')[1];
        
        if (!questionPerformance[questionId]) {
          questionPerformance[questionId] = { 
            correct: 0, 
            total: 0, 
            averageTime: 0,
            lastAttempt: data.date
          };
        }
        
        if (data.score >= 70) { // Assuming 70+ is correct
          questionPerformance[questionId].correct += 1;
        }
        
        questionPerformance[questionId].total += 1;
        
        // Update average time
        const currentTotal = questionPerformance[questionId].averageTime * 
                            (questionPerformance[questionId].total - 1);
        const newAverage = (currentTotal + data.studyTime) / 
                            questionPerformance[questionId].total;
        
        questionPerformance[questionId].averageTime = newAverage;
        
        // Update last attempt date if more recent
        if (data.date > questionPerformance[questionId].lastAttempt) {
          questionPerformance[questionId].lastAttempt = data.date;
        }
      }
    }

    // Format the data for response
    const analyticsData = await Promise.all(
      Object.entries(questionPerformance).map(async ([questionId, data]) => {
        const question = await Question.findById(questionId);
        return {
          questionId,
          subject: question?.subject || 'Unknown',
          format: question?.format || 'Unknown',
          difficulty: question?.difficulty || 'Unknown',
          correctRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          attempts: data.total,
          averageTimeSeconds: Math.round(data.averageTime),
          lastAttempted: data.lastAttempt
        };
      })
    );

    res.status(200).json({
      analytics: analyticsData,
      questionCount: analyticsData.length
    });
  } catch (error: any) {
    console.error('Get question analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a question (admin only)
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { 
      question, 
      options, 
      correctAnswer, 
      subject, 
      difficulty, 
      format,
      explanation,
      hints
    } = req.body;

    // Find and update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        question,
        options,
        correctAnswer,
        subject,
        difficulty,
        format,
        explanation,
        hints
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error: any) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a question (admin only)
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    // Find and delete the question
    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      message: 'Question deleted successfully',
      questionId
    });
  } catch (error: any) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 