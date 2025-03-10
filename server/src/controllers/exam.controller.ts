import { Request, Response } from 'express';
import Exam from '../models/exam.model';
import Question from '../models/question.model';
import ExamAttempt from '../models/examAttempt.model';
import PerformanceData from '../models/performanceData.model';
import User from '../models/user.model';
import { checkBadgeEligibility } from './badge.controller';

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
      const question = q.toObject();
      delete question.correctAnswer;
      return question;
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
    const processedAnswers = [];
    
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
    
    // Track time spent by subject
    const timeBySubject: Record<string, number> = {};
    
    // Get all questions for detailed info
    const questionDetails = [];
    
    for (const answer of processedAnswers) {
      const question = await Question.findById(answer.questionId);
      
      if (!question) continue;
      
      // Subject performance
      if (!subjectPerformance[question.subject]) {
        subjectPerformance[question.subject] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        subjectPerformance[question.subject].correct += 1;
      }
      
      subjectPerformance[question.subject].total += 1;
      
      // Format performance (question type)
      if (!formatPerformance[question.format]) {
        formatPerformance[question.format] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        formatPerformance[question.format].correct += 1;
      }
      
      formatPerformance[question.format].total += 1;
      
      // Difficulty performance
      if (!difficultyPerformance[question.difficulty]) {
        difficultyPerformance[question.difficulty] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        difficultyPerformance[question.difficulty].correct += 1;
      }
      
      difficultyPerformance[question.difficulty].total += 1;
      
      // Time tracking
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
    
    Object.entries(subjectPerformance).forEach(([subject, { correct, total }]) => {
      subjectScores[subject] = Math.round((correct / total) * 100);
    });
    
    // Calculate format scores
    const formatScores: Record<string, number> = {};
    
    Object.entries(formatPerformance).forEach(([format, { correct, total }]) => {
      formatScores[format] = Math.round((correct / total) * 100);
    });
    
    // Calculate difficulty scores
    const difficultyScores: Record<string, number> = {};
    
    Object.entries(difficultyPerformance).forEach(([difficulty, { correct, total }]) => {
      difficultyScores[difficulty] = Math.round((correct / total) * 100);
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
      const sanitizedQuestion = anyQuestion.toObject();
      delete sanitizedQuestion.correctAnswer;

      return res.status(200).json(sanitizedQuestion);
    }

    // Remove correct answer from question
    const sanitizedQuestion = nextQuestion.toObject();
    delete sanitizedQuestion.correctAnswer;

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