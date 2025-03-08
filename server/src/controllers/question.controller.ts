import { Request, Response } from 'express';
import Question from '../models/question.model';
import PerformanceData from '../models/performanceData.model';

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

    // Save performance data
    const performanceData = await PerformanceData.create({
      userId,
      subject: question.subject,
      subtopic: question.subject, // Using subject as subtopic for now
      score,
      studyTime: timeSpent || 0,
      date: new Date(),
    });

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
        subject: question.subject,
        difficulty: question.difficulty,
        _id: { $ne: question._id }, // Exclude current question
      }).limit(3);
    }

    res.status(200).json({
      isCorrect,
      score,
      explanation,
      hint,
      similarQuestions,
      performanceData,
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