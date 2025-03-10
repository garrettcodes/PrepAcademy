import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define interfaces
interface Question {
  _id: string;
  text: string;
  options: string[];
  subject: string;
  difficulty: string;
  format: string;
  hints?: string[];
  explanations?: {
    visual?: string;
    auditory?: string;
    kinesthetic?: string;
    text?: string;
  };
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  difficulty: string;
}

interface ExamWithQuestions extends Exam {
  questions: Question[];
  attemptId: string;
}

interface ExamResult {
  score: number;
  subjectScores: Record<string, number>;
  formatScores: Record<string, number>;
  difficultyScores: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  timeBySubject: Record<string, number>;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  strongestSubject: string | null;
  weakestSubject: string | null;
  subjectFormatBreakdown: Record<string, Record<string, { correct: number; total: number }>>;
  questionDetails: {
    id: string;
    subject: string;
    format: string;
    difficulty: string;
    isCorrect: boolean;
    timeSpent: number;
    userAnswer: string;
    correctAnswer: string;
  }[];
  examTitle: string;
  examType: string;
  examDuration: number;
  completedAt: string;
}

interface AnswerResult {
  isCorrect: boolean;
  score: number;
  explanation?: string;
  hint?: string;
  similarQuestions?: Question[];
}

// Define practice context interface
interface PracticeContextType {
  questions: Question[];
  currentQuestion: Question | null;
  exams: Exam[];
  currentExam: ExamWithQuestions | null;
  examResult: ExamResult | null;
  lastAnswerResult: AnswerResult | null;
  loading: boolean;
  error: string | null;
  fetchQuestions: (subject?: string, difficulty?: string, format?: string, limit?: number) => Promise<void>;
  fetchExams: () => Promise<void>;
  fetchExamById: (examId: string) => Promise<void>;
  submitAnswer: (questionId: string, selectedAnswer: string, timeSpent?: number) => Promise<AnswerResult>;
  submitExam: (examId: string, answers: any[], endTime?: Date) => Promise<void>;
  getNextAdaptiveQuestion: (examId: string, lastQuestionId: string, wasCorrect: boolean) => Promise<Question | null>;
  resetCurrentQuestion: () => void;
  resetExamResult: () => void;
  clearError: () => void;
  fetchExamDetails: (examId: string) => Promise<void>;
}

// Create practice context
const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// Create practice provider component
export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<ExamWithQuestions | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions
  const fetchQuestions = async (subject?: string, difficulty?: string, format?: string, limit?: number) => {
    try {
      setLoading(true);
      let url = `${API_URL}/questions`;
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (difficulty) params.append('difficulty', difficulty);
      if (format) params.append('format', format);
      if (limit) params.append('limit', limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setQuestions(response.data);
      
      // Set current question if not already set
      if (!currentQuestion && response.data.length > 0) {
        setCurrentQuestion(response.data[0]);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch exams
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/exams`);
      setExams(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam by ID with questions
  const fetchExamById = async (examId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/exams/${examId}`);
      setCurrentExam(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exam');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for a question
  const submitAnswer = async (questionId: string, selectedAnswer: string, timeSpent?: number): Promise<AnswerResult> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/questions/answer`, {
        questionId,
        selectedAnswer,
        timeSpent,
      });
      
      const result = {
        isCorrect: response.data.isCorrect,
        score: response.data.score,
        explanation: response.data.explanation,
        hint: response.data.hint,
        similarQuestions: response.data.similarQuestions,
      };
      
      setLastAnswerResult(result);
      setError(null);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit answer';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Submit an exam
  const submitExam = async (examId: string, answers: any[], endTime?: Date) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/exams/${examId}/submit`, {
        answers,
        endTime,
      });
      
      setExamResult({
        score: response.data.score,
        subjectScores: response.data.subjectScores,
        formatScores: response.data.formatScores,
        difficultyScores: response.data.difficultyScores,
        correctCount: response.data.correctCount,
        totalQuestions: response.data.totalQuestions,
        timeBySubject: response.data.timeBySubject,
        totalTimeSpent: response.data.totalTimeSpent,
        averageTimePerQuestion: response.data.averageTimePerQuestion,
        strongestSubject: response.data.strongestSubject,
        weakestSubject: response.data.weakestSubject,
        subjectFormatBreakdown: response.data.subjectFormatBreakdown,
        questionDetails: response.data.questionDetails,
        examTitle: response.data.examTitle,
        examType: response.data.examType,
        examDuration: response.data.examDuration,
        completedAt: response.data.completedAt,
      });
      
      setCurrentExam(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit exam');
    } finally {
      setLoading(false);
    }
  };

  // Get next adaptive question
  const getNextAdaptiveQuestion = async (examId: string, lastQuestionId: string, wasCorrect: boolean): Promise<Question | null> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/exams/next-question`, {
        examId,
        lastQuestionId,
        wasCorrect,
      });
      
      if (response.data) {
        setCurrentQuestion(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get next question');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reset current question
  const resetCurrentQuestion = () => {
    setCurrentQuestion(null);
    setLastAnswerResult(null);
  };

  // Reset exam result
  const resetExamResult = () => {
    setExamResult(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch detailed exam report
  const fetchExamDetails = async (examId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/exams/${examId}/results`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        // Update the examResult with detailed data
        setExamResult({
          score: response.data.score,
          subjectScores: response.data.subjectScores,
          formatScores: response.data.formatScores,
          difficultyScores: response.data.difficultyScores,
          correctCount: response.data.correctCount,
          totalQuestions: response.data.totalQuestions,
          timeBySubject: response.data.timeBySubject,
          totalTimeSpent: response.data.totalTimeSpent,
          averageTimePerQuestion: response.data.averageTimePerQuestion,
          strongestSubject: response.data.strongestSubject,
          weakestSubject: response.data.weakestSubject,
          subjectFormatBreakdown: response.data.subjectFormatBreakdown,
          questionDetails: response.data.questionDetails,
          examTitle: response.data.examTitle,
          examType: response.data.examType,
          examDuration: response.data.examDuration,
          completedAt: response.data.completedAt,
        });
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PracticeContext.Provider
      value={{
        questions,
        currentQuestion,
        exams,
        currentExam,
        examResult,
        lastAnswerResult,
        loading,
        error,
        fetchQuestions,
        fetchExams,
        fetchExamById,
        submitAnswer,
        submitExam,
        getNextAdaptiveQuestion,
        resetCurrentQuestion,
        resetExamResult,
        clearError,
        fetchExamDetails,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

// Create hook for using practice context
export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
}; 