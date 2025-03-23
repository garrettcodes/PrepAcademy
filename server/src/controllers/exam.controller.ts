import { Request, Response } from 'express';
import Exam from '../models/exam.model';
import Question from '../models/question.model';
import ExamAttempt from '../models/examAttempt.model';
import PerformanceData from '../models/performanceData.model';
import User from '../models/user.model';
import { checkBadgeEligibility } from './badge.controller';
import mongoose from 'mongoose';

// Define interfaces for type safety
interface ProcessedAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuestionPerformance {
  id: string;
  subject: string;
  format: string;
  difficulty: string;
  isCorrect: boolean;
  timeSpent: number;
  userAnswer: string;
  correctAnswer: string;
}

// Get all available exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find().select('-questions');

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: 'No exams found' });
    }

    res.status(200).json(exams);
  } catch (error: any) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific exam with questions
export const getExamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam without populating questions first
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Create a new exam attempt
    const examAttempt = await ExamAttempt.create({
      userId: req.user.userId,
      examId: exam._id,
      startTime: new Date(),
      completed: false,
    });

    // Get questions for the exam
    let questions;
    
    if (exam.difficulty === 'adaptive') {
      // For adaptive exams, start with medium difficulty questions
      questions = await Question.find({
        _id: { $in: exam.questions },
        difficulty: 'medium',
      }).limit(10); // Start with 10 questions
    } else {
      // For fixed difficulty exams, get all questions
      questions = await Question.find({
        _id: { $in: exam.questions },
      });
    }

    // Remove correct answers from questions
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...sanitizedQuestion } = q.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        difficulty: exam.difficulty,
      },
      questions: sanitizedQuestions,
      attemptId: examAttempt._id,
    });
  } catch (error: any) {
    console.error('Get exam by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit an exam
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers, endTime } = req.body;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find the exam
    const exam = await Exam.findById(id).populate('questions');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Find the exam attempt
    const examAttempt = await ExamAttempt.findOne({
      userId,
      examId: exam._id,
      completed: false,
    }).sort({ startTime: -1 });
    
    if (!examAttempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Process answers and calculate score
    let correctCount = 0;
    const processedAnswers: ProcessedAnswer[] = [];
    const questionPerformance: QuestionPerformance[] = [];
    
    for (const answer of answers) {
      const { questionId, selectedAnswer, timeSpent } = answer;
      
      // Find the question
      const question = await Question.findById(questionId);
      
      if (!question) continue;
      
      // Check if answer is correct
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Add to processed answers
      processedAnswers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
      });

      // Save performance data
      await PerformanceData.create({
        userId,
        subject: question.subject,
        subtopic: question.subject, // Using subject as subtopic for now
        score: isCorrect ? 100 : 0,
        studyTime: timeSpent || 0,
        date: new Date(),
      });

      // Add to question performance
      questionPerformance.push({
        id: question._id.toString(),
        subject: question.subject,
        format: question.format,
        difficulty: question.difficulty,
        isCorrect,
        timeSpent: timeSpent || 0,
        userAnswer: selectedAnswer,
        correctAnswer: question.correctAnswer
      });
    }

    // Calculate score percentage
    const score = Math.round((correctCount / answers.length) * 100);

    // Award points based on score (1 point per percent score)
    const pointsAwarded = score;
    await User.findByIdAndUpdate(userId, { $inc: { points: pointsAwarded } });

    // Check for new badges
    const earnedBadges = await checkBadgeEligibility(userId);

    // Update exam attempt
    const updatedAttempt = await ExamAttempt.findByIdAndUpdate(
      examAttempt._id,
      {
        answers: processedAnswers,
        endTime: endTime || new Date(),
        score,
        completed: true,
      },
      { new: true }
    );

    // Track time spent by subject
    const timeBySubject: Record<string, number> = {};

    // Get all questions for detailed info
    const questionDetails: QuestionPerformance[] = [];
    
    for (const answer of processedAnswers) {
      const question = await Question.findById(answer.questionId);
      
      if (!question) continue;
      
      // Subject performance
      if (!timeBySubject[question.subject]) {
        timeBySubject[question.subject] = 0;
      }
      
      timeBySubject[question.subject] += answer.timeSpent || 0;
      
      // Add question details for more detailed reporting
      questionDetails.push({
        id: question._id,
        subject: question.subject,
        format: question.format,
        difficulty: question.difficulty,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent || 0,
        userAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer
      });
    }

    // Calculate subject scores
    const subjectScores: Record<string, number> = {};
    
    Object.entries(timeBySubject).forEach(([subject, time]) => {
      subjectScores[subject] = Math.round((time / answers.length) * 100);
    });
    
    // Calculate format scores
    const formatScores: Record<string, number> = {};
    
    questionDetails.forEach(q => {
      if (!formatScores[q.format]) {
        formatScores[q.format] = 0;
      }
      
      if (q.isCorrect) {
        formatScores[q.format] += 1;
      }
    });
    
    // Calculate difficulty scores
    const difficultyScores: Record<string, number> = {};
    
    questionDetails.forEach(q => {
      if (!difficultyScores[q.difficulty]) {
        difficultyScores[q.difficulty] = 0;
      }
      
      if (q.isCorrect) {
        difficultyScores[q.difficulty] += 1;
      }
    });
    
    // Generate breakdown by subject and format
    const subjectFormatBreakdown: Record<string, Record<string, { correct: number; total: number }>> = {};
    
    // Group questions by both subject and format
    questionDetails.forEach(q => {
      if (!subjectFormatBreakdown[q.subject]) {
        subjectFormatBreakdown[q.subject] = {};
      }
      
      if (!subjectFormatBreakdown[q.subject][q.format]) {
        subjectFormatBreakdown[q.subject][q.format] = { correct: 0, total: 0 };
      }
      
      if (q.isCorrect) {
        subjectFormatBreakdown[q.subject][q.format].correct += 1;
      }
      
      subjectFormatBreakdown[q.subject][q.format].total += 1;
    });

    // Calculate time metrics
    const totalTimeSpent = Object.values(timeBySubject).reduce((sum, time) => sum + time, 0);
    const averageTimePerQuestion = totalTimeSpent / answers.length;
    
    // Identify strongest and weakest areas
    const subjectScoreArray = Object.entries(subjectScores);
    const strongestSubject = subjectScoreArray.length > 0 
      ? subjectScoreArray.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)
      : null;
      
    const weakestSubject = subjectScoreArray.length > 0
      ? subjectScoreArray.reduce((prev, curr) => curr[1] < prev[1] ? curr : prev)
      : null;

    res.status(200).json({
      message: 'Exam submitted successfully',
      examAttempt: updatedAttempt,
      score,
      pointsAwarded,
      earnedBadges: earnedBadges || [],
      report: {
        subjectScores,
        formatScores,
        difficultyScores,
        timeBySubject,
        questionDetails
      }
    });
  } catch (error: any) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get next question for adaptive exam
export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    // If it's a GET request, use params for examId and query for other params
    // If it's a POST request, use body for all params
    const examId = req.method === 'GET' ? req.params.id : req.body.examId;
    const lastQuestionId = req.method === 'GET' ? req.query.lastQuestionId as string : req.body.lastQuestionId;
    const wasCorrect = req.method === 'GET' 
      ? req.query.wasCorrect === 'true' 
      : req.body.wasCorrect;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find the exam
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Find the exam attempt
    const examAttempt = await ExamAttempt.findOne({
      userId,
      examId,
      completed: false,
    }).sort({ startTime: -1 });
    
    if (!examAttempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    let nextDifficulty = 'medium'; // Default start with medium difficulty

    if (lastQuestionId) {
      // Find the last question
      const lastQuestion = await Question.findById(lastQuestionId);
      
      if (!lastQuestion) {
        return res.status(404).json({ message: 'Last question not found' });
      }

      // Determine next difficulty level based on user's performance
      if (wasCorrect === true) {
        // If last answer was correct, increase difficulty
        nextDifficulty = lastQuestion.difficulty === 'easy' ? 'medium' : 'hard';
      } else {
        // If last answer was incorrect, decrease difficulty
        nextDifficulty = lastQuestion.difficulty === 'hard' ? 'medium' : 'easy';
      }
    }

    // Get already answered question IDs
    const answeredQuestionIds = examAttempt.answers.map(a => a.questionId.toString());

    // Find next question with appropriate difficulty
    const nextQuestion = await Question.findOne({
      _id: { $in: exam.questions, $nin: answeredQuestionIds },
      difficulty: nextDifficulty,
    });

    // If no question found with the adaptive difficulty, try finding any unanswered question
    if (!nextQuestion) {
      const anyQuestion = await Question.findOne({
        _id: { $in: exam.questions, $nin: answeredQuestionIds },
      });

      if (!anyQuestion) {
        return res.status(404).json({ message: 'No more questions available' });
      }

      // Remove correct answer from question
      const { correctAnswer, ...sanitizedQuestion } = anyQuestion.toObject();

      return res.status(200).json(sanitizedQuestion);
    }

    // Remove correct answer from question
    const { correctAnswer, ...sanitizedQuestion } = nextQuestion.toObject();

    res.status(200).json(sanitizedQuestion);
  } catch (error: any) {
    console.error('Get next question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new exam (admin only)
export const createExam = async (req: Request, res: Response) => {
  try {
    const { title, description, type, duration, questions, difficulty } = req.body;

    // Create new exam
    const exam = await Exam.create({
      title,
      description,
      type,
      duration,
      questions: questions || [],
      difficulty: difficulty || 'adaptive',
    });

    res.status(201).json(exam);
  } catch (error: any) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed exam results
export const getExamResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find the completed exam attempt
    const examAttempt = await ExamAttempt.findOne({
      examId: id,
      userId,
      completed: true
    }).sort({ endTime: -1 });
    
    if (!examAttempt) {
      return res.status(404).json({ message: 'Exam result not found' });
    }

    // Find the exam
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Calculate overall stats
    const correctCount = examAttempt.answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = examAttempt.answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Calculate total time spent
    const timeSpent = examAttempt.answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);

    // Generate report by subject
    const subjectPerformance: Record<string, { correct: number; total: number }> = {};
    
    // Generate report by question type
    const questionTypePerformance: Record<string, { correct: number; total: number }> = {};
    
    // Generate report by difficulty
    const difficultyPerformance: Record<string, { correct: number; total: number }> = {};
    
    // Process each answer
    for (const answer of examAttempt.answers) {
      // Find the question
      const question = await Question.findById(answer.questionId);
      
      if (!question) continue;
      
      // Add to subject performance
      if (!subjectPerformance[question.subject]) {
        subjectPerformance[question.subject] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        subjectPerformance[question.subject].correct += 1;
      }
      
      subjectPerformance[question.subject].total += 1;
      
      // Add to question type performance (using format as question type)
      if (!questionTypePerformance[question.format]) {
        questionTypePerformance[question.format] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        questionTypePerformance[question.format].correct += 1;
      }
      
      questionTypePerformance[question.format].total += 1;
      
      // Add to difficulty performance
      if (!difficultyPerformance[question.difficulty]) {
        difficultyPerformance[question.difficulty] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        difficultyPerformance[question.difficulty].correct += 1;
      }
      
      difficultyPerformance[question.difficulty].total += 1;
    }

    // Calculate subject scores
    const subjectScores: Record<string, number> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { correct, total }]) => {
      subjectScores[subject] = Math.round((correct / total) * 100);
    });

    res.status(200).json({
      score,
      subjectScores,
      correctCount,
      totalQuestions,
      timeSpent,
      questionTypes: questionTypePerformance,
      difficultyBreakdown: difficultyPerformance,
      examAttempt: {
        startTime: examAttempt.startTime,
        endTime: examAttempt.endTime,
        _id: examAttempt._id
      }
    });
  } catch (error: any) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get basic exams (limited content for trial users)
export const getBasicExams = async (req: Request, res: Response) => {
  try {
    // Find exams with type 'basic' or filter by a field indicating basic exams
    const exams = await Exam.find({ type: 'basic' }).select('-questions');

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: 'No basic exams found' });
    }

    res.status(200).json(exams);
  } catch (error: any) {
    console.error('Get basic exams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific basic exam
export const getBasicExamById = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam without populating questions first
    const exam = await Exam.findOne({ _id: examId, type: 'basic' });
    
    if (!exam) {
      return res.status(404).json({ message: 'Basic exam not found' });
    }

    // Create a new exam attempt
    const examAttempt = await ExamAttempt.create({
      userId: req.user.userId,
      examId: exam._id,
      startTime: new Date(),
      completed: false,
    });

    // Get questions for the exam
    const questions = await Question.find({
      _id: { $in: exam.questions },
    });

    // Remove correct answers from questions
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...sanitizedQuestion } = q.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        difficulty: exam.difficulty,
      },
      questions: sanitizedQuestions,
      attemptId: examAttempt._id,
    });
  } catch (error: any) {
    console.error('Get basic exam by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start a basic exam
export const startBasicExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam without populating questions first
    const exam = await Exam.findOne({ _id: examId, type: 'basic' });
    
    if (!exam) {
      return res.status(404).json({ message: 'Basic exam not found' });
    }

    // Create a new exam attempt
    const examAttempt = await ExamAttempt.create({
      userId: req.user.userId,
      examId: exam._id,
      startTime: new Date(),
      completed: false,
    });

    // Get questions for the exam
    const questions = await Question.find({
      _id: { $in: exam.questions },
    });

    // Remove correct answers from questions
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...sanitizedQuestion } = q.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        difficulty: exam.difficulty,
      },
      questions: sanitizedQuestions,
      attemptId: examAttempt._id,
    });
  } catch (error: any) {
    console.error('Start basic exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit a basic exam
export const submitBasicExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { answers, endTime } = req.body;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find the exam
    const exam = await Exam.findOne({ _id: examId, type: 'basic' }).populate('questions');
    
    if (!exam) {
      return res.status(404).json({ message: 'Basic exam not found' });
    }

    // Find the exam attempt
    const examAttempt = await ExamAttempt.findOne({
      userId,
      examId: exam._id,
      completed: false,
    }).sort({ startTime: -1 });
    
    if (!examAttempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Process answers and calculate score
    let correctCount = 0;
    const processedAnswers: ProcessedAnswer[] = [];
    
    for (const answer of answers) {
      const { questionId, selectedAnswer, timeSpent } = answer;
      
      // Find the question
      const question = await Question.findById(questionId);
      
      if (!question) continue;
      
      // Check if answer is correct
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Add to processed answers
      processedAnswers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
      });
    }

    // Calculate score percentage
    const score = Math.round((correctCount / answers.length) * 100);

    // Award points based on score (1 point per percent score)
    const pointsAwarded = score;
    await User.findByIdAndUpdate(userId, { $inc: { points: pointsAwarded } });

    // Check for new badges
    const earnedBadges = await checkBadgeEligibility(userId);

    // Update exam attempt
    const updatedAttempt = await ExamAttempt.findByIdAndUpdate(
      examAttempt._id,
      {
        answers: processedAnswers,
        endTime: endTime || new Date(),
        score,
        completed: true,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Basic exam submitted successfully',
      examAttempt: updatedAttempt,
      score,
      pointsAwarded,
      earnedBadges: earnedBadges || [],
    });
  } catch (error: any) {
    console.error('Submit basic exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all full practice exams
export const getFullExams = async (req: Request, res: Response) => {
  try {
    // Find exams with type 'full' or filter by a field indicating full exams
    const exams = await Exam.find({ type: 'full' }).select('-questions');

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: 'No full exams found' });
    }

    res.status(200).json(exams);
  } catch (error: any) {
    console.error('Get full exams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific full practice exam
export const getFullExamById = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam without populating questions first
    const exam = await Exam.findOne({ _id: examId, type: 'full' });
    
    if (!exam) {
      return res.status(404).json({ message: 'Full exam not found' });
    }

    // Create a new exam attempt
    const examAttempt = await ExamAttempt.create({
      userId: req.user.userId,
      examId: exam._id,
      startTime: new Date(),
      completed: false,
    });

    // Get questions for the exam
    const questions = await Question.find({
      _id: { $in: exam.questions },
    });

    // Remove correct answers from questions
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...sanitizedQuestion } = q.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        difficulty: exam.difficulty,
      },
      questions: sanitizedQuestions,
      attemptId: examAttempt._id,
    });
  } catch (error: any) {
    console.error('Get full exam by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start a full practice exam
export const startFullExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam without populating questions first
    const exam = await Exam.findOne({ _id: examId, type: 'full' });
    
    if (!exam) {
      return res.status(404).json({ message: 'Full exam not found' });
    }

    // Create a new exam attempt
    const examAttempt = await ExamAttempt.create({
      userId: req.user.userId,
      examId: exam._id,
      startTime: new Date(),
      completed: false,
    });

    // Get questions for the exam
    const questions = await Question.find({
      _id: { $in: exam.questions },
    });

    // Remove correct answers from questions
    const sanitizedQuestions = questions.map(q => {
      const { correctAnswer, ...sanitizedQuestion } = q.toObject();
      return sanitizedQuestion;
    });

    res.status(200).json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        duration: exam.duration,
        difficulty: exam.difficulty,
      },
      questions: sanitizedQuestions,
      attemptId: examAttempt._id,
    });
  } catch (error: any) {
    console.error('Start full exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit a full practice exam
export const submitFullExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { answers, endTime } = req.body;
    
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find the exam
    const exam = await Exam.findOne({ _id: examId, type: 'full' }).populate('questions');
    
    if (!exam) {
      return res.status(404).json({ message: 'Full exam not found' });
    }

    // Find the exam attempt
    const examAttempt = await ExamAttempt.findOne({
      userId,
      examId: exam._id,
      completed: false,
    }).sort({ startTime: -1 });
    
    if (!examAttempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Process answers and calculate score
    let correctCount = 0;
    const processedAnswers: ProcessedAnswer[] = [];
    const questionPerformance: QuestionPerformance[] = [];
    
    for (const answer of answers) {
      const { questionId, selectedAnswer, timeSpent } = answer;
      
      // Find the question
      const question = await Question.findById(questionId);
      
      if (!question) continue;
      
      // Check if answer is correct
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Add to processed answers
      processedAnswers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
      });

      // Save performance data
      await PerformanceData.create({
        userId,
        subject: question.subject,
        subtopic: question.subject, // Using subject as subtopic for now
        score: isCorrect ? 100 : 0,
        studyTime: timeSpent || 0,
        date: new Date(),
      });

      // Add to question performance
      questionPerformance.push({
        id: question._id.toString(),
        subject: question.subject,
        format: question.format,
        difficulty: question.difficulty,
        isCorrect,
        timeSpent: timeSpent || 0,
        userAnswer: selectedAnswer,
        correctAnswer: question.correctAnswer
      });
    }

    // Calculate score percentage
    const score = Math.round((correctCount / answers.length) * 100);

    // Award points based on score (1 point per percent score)
    const pointsAwarded = score;
    await User.findByIdAndUpdate(userId, { $inc: { points: pointsAwarded } });

    // Check for new badges
    const earnedBadges = await checkBadgeEligibility(userId);

    // Update exam attempt
    const updatedAttempt = await ExamAttempt.findByIdAndUpdate(
      examAttempt._id,
      {
        answers: processedAnswers,
        endTime: endTime || new Date(),
        score,
        completed: true,
      },
      { new: true }
    );

    // Generate report by subject
    const subjectPerformance: Record<string, { correct: number; total: number }> = {};
    
    // Generate report by format (question type)
    const formatPerformance: Record<string, { correct: number; total: number }> = {};
    
    // Generate report by difficulty
    const difficultyPerformance: Record<string, { correct: number; total: number }> = {};
    
    // Process for detailed reporting
    for (const qp of questionPerformance) {
      // Subject performance
      if (!subjectPerformance[qp.subject]) {
        subjectPerformance[qp.subject] = { correct: 0, total: 0 };
      }
      
      if (qp.isCorrect) {
        subjectPerformance[qp.subject].correct += 1;
      }
      
      subjectPerformance[qp.subject].total += 1;
      
      // Format performance
      if (!formatPerformance[qp.format]) {
        formatPerformance[qp.format] = { correct: 0, total: 0 };
      }
      
      if (qp.isCorrect) {
        formatPerformance[qp.format].correct += 1;
      }
      
      formatPerformance[qp.format].total += 1;
      
      // Difficulty performance
      if (!difficultyPerformance[qp.difficulty]) {
        difficultyPerformance[qp.difficulty] = { correct: 0, total: 0 };
      }
      
      if (qp.isCorrect) {
        difficultyPerformance[qp.difficulty].correct += 1;
      }
      
      difficultyPerformance[qp.difficulty].total += 1;
    }

    // Calculate subject scores
    const subjectScores: Record<string, number> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { correct, total }]) => {
      subjectScores[subject] = Math.round((correct / total) * 100);
    });

    res.status(200).json({
      message: 'Full exam submitted successfully',
      examAttempt: updatedAttempt,
      score,
      pointsAwarded,
      earnedBadges: earnedBadges || [],
      report: {
        subjectScores,
        formatPerformance,
        difficultyPerformance
      }
    });
  } catch (error: any) {
    console.error('Submit full exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's exam history with analytics
export const getUserExamHistory = async (req: Request, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;

    // Find all completed exam attempts for the user
    const examAttempts = await ExamAttempt.find({
      userId,
      completed: true
    }).sort({ endTime: -1 }).populate('examId', 'title type');

    if (!examAttempts || examAttempts.length === 0) {
      return res.status(404).json({ message: 'No exam history found' });
    }

    // Calculate average score across all exams
    const totalScore = examAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = Math.round(totalScore / examAttempts.length);

    // Group by exam type
    const basicExams = examAttempts.filter(attempt => attempt.examId && (attempt.examId as any).type === 'basic');
    const fullExams = examAttempts.filter(attempt => attempt.examId && (attempt.examId as any).type === 'full');

    // Calculate progress over time
    const timelineData = examAttempts.map(attempt => ({
      date: attempt.endTime,
      score: attempt.score,
      examTitle: attempt.examId ? (attempt.examId as any).title : 'Unknown Exam',
      examType: attempt.examId ? (attempt.examId as any).type : 'unknown'
    }));

    res.status(200).json({
      totalExamsTaken: examAttempts.length,
      averageScore,
      basicExamsTaken: basicExams.length,
      fullExamsTaken: fullExams.length,
      recentExams: examAttempts.slice(0, 5).map(attempt => ({
        attemptId: attempt._id,
        examTitle: attempt.examId ? (attempt.examId as any).title : 'Unknown Exam',
        score: attempt.score,
        date: attempt.endTime,
        examType: attempt.examId ? (attempt.examId as any).type : 'unknown'
      })),
      timeline: timelineData
    });
  } catch (error: any) {
    console.error('Get user exam history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an exam (admin only)
export const updateExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { title, description, type, duration, questions, difficulty } = req.body;

    // Find exam and update it
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        title,
        description,
        type,
        duration,
        questions: questions || [],
        difficulty: difficulty || 'adaptive',
      },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json(updatedExam);
  } catch (error: any) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an exam (admin only)
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    // Find exam and delete it
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Delete all associated exam attempts
    await ExamAttempt.deleteMany({ examId });

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error: any) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 