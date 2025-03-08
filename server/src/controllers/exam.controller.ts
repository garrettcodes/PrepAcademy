import { Request, Response } from 'express';
import Exam from '../models/exam.model';
import Question from '../models/question.model';
import ExamAttempt from '../models/examAttempt.model';
import PerformanceData from '../models/performanceData.model';

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
    
    for (const answer of processedAnswers) {
      const question = await Question.findById(answer.questionId);
      
      if (!question) continue;
      
      if (!subjectPerformance[question.subject]) {
        subjectPerformance[question.subject] = { correct: 0, total: 0 };
      }
      
      if (answer.isCorrect) {
        subjectPerformance[question.subject].correct += 1;
      }
      
      subjectPerformance[question.subject].total += 1;
    }

    // Calculate subject scores
    const subjectScores: Record<string, number> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { correct, total }]) => {
      subjectScores[subject] = Math.round((correct / total) * 100);
    });

    res.status(200).json({
      score,
      subjectScores,
      examAttempt: updatedAttempt,
      correctCount,
      totalQuestions: answers.length,
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