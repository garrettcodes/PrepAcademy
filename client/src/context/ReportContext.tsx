import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useParentAuth } from './ParentAuthContext';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ProgressReport {
  student: {
    _id: string;
    name: string;
    email: string;
    targetScore: number;
    testDate: string;
  };
  timeframe: string;
  statistics: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalQuestionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    totalStudyTimeMinutes: number;
    examScores: Array<{
      examName: string;
      score: number;
      date: string;
    }>;
    subjectPerformance: Record<string, {
      totalQuestions: number;
      correctAnswers: number;
      accuracy: number;
    }>;
  };
  performanceData: Array<any>;
  examAttempts: Array<any>;
}

interface StudyTimeReport {
  student: {
    _id: string;
    name: string;
    email: string;
  };
  timeframe: string;
  studyTimeStats: {
    totalStudyTimeMinutes: number;
    averageDailyStudyTimeMinutes: number;
    mostProductiveDay: {
      date: string;
      studyTimeMinutes: number;
    } | null;
    studyTimeBySubject: Record<string, number>;
  };
  dailyStudyTime: Array<{
    date: string;
    totalMinutes: number;
    subjects: Record<string, number>;
  }>;
}

interface TaskCompletionReport {
  student: {
    _id: string;
    name: string;
    email: string;
  };
  timeframe: string;
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    upcomingTasks: Array<{
      task: string;
      week: number;
      day: number;
      subject: string;
    }>;
    recentlyCompletedTasks: Array<{
      task: string;
      score: number;
      date: string;
      subject: string;
    }>;
  };
  studyPlan: any;
  completedExams: Array<any>;
}

interface IReportContext {
  loading: boolean;
  error: string | null;
  progressReport: ProgressReport | null;
  studyTimeReport: StudyTimeReport | null;
  taskCompletionReport: TaskCompletionReport | null;
  getProgressReport: (studentId: string, timeframe?: string) => Promise<ProgressReport | null>;
  getStudyTimeReport: (studentId: string, timeframe?: string) => Promise<StudyTimeReport | null>;
  getTaskCompletionReport: (studentId: string, timeframe?: string) => Promise<TaskCompletionReport | null>;
  clearError: () => void;
}

// Create report context
const ReportContext = createContext<IReportContext | undefined>(undefined);

// Create report provider component
export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);
  const [studyTimeReport, setStudyTimeReport] = useState<StudyTimeReport | null>(null);
  const [taskCompletionReport, setTaskCompletionReport] = useState<TaskCompletionReport | null>(null);
  
  const { parent } = useParentAuth();

  // Get progress report
  const getProgressReport = async (studentId: string, timeframe?: string): Promise<ProgressReport | null> => {
    try {
      setLoading(true);
      let url = `${API_URL}/reports/progress/${studentId}`;
      if (timeframe) {
        url += `?timeframe=${timeframe}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${parent?.token}`,
        },
      });
      
      setProgressReport(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error fetching progress report';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get study time report
  const getStudyTimeReport = async (studentId: string, timeframe?: string): Promise<StudyTimeReport | null> => {
    try {
      setLoading(true);
      let url = `${API_URL}/reports/study-time/${studentId}`;
      if (timeframe) {
        url += `?timeframe=${timeframe}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${parent?.token}`,
        },
      });
      
      setStudyTimeReport(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error fetching study time report';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get task completion report
  const getTaskCompletionReport = async (studentId: string, timeframe?: string): Promise<TaskCompletionReport | null> => {
    try {
      setLoading(true);
      let url = `${API_URL}/reports/task-completion/${studentId}`;
      if (timeframe) {
        url += `?timeframe=${timeframe}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${parent?.token}`,
        },
      });
      
      setTaskCompletionReport(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error fetching task completion report';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <ReportContext.Provider
      value={{
        loading,
        error,
        progressReport,
        studyTimeReport,
        taskCompletionReport,
        getProgressReport,
        getStudyTimeReport,
        getTaskCompletionReport,
        clearError,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// Create custom hook to use report context
export const useReport = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}; 