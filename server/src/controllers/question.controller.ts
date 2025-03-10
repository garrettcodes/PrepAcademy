import { Request, Response } from 'express';
import Question from '../models/question.model';
import PerformanceData from '../models/performanceData.model';
import User from '../models/user.model';
import { checkBadgeEligibility } from './badge.controller';

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
    const userId = req.user.userId;

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
    const user = req.user;
    let explanation = question.explanations.text; // Default to text explanation
    
    if (user.learningStyle && question.explanations[user.learningStyle]) {
      explanation = question.explanations[user.learningStyle];
    }

    // Get next hint if answer is incorrect
    let hint = null;
    if (!isCorrect && question.hints && question.hints.length > 0) {
      hint = question.hints[0]; // Just get the first hint for simplicity
    }

    // Get similar questions for additional practice if answer is incorrect
    let similarQuestions = [];
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