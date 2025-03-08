import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define interfaces
interface Task {
  _id?: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
}

interface StudyPlan {
  _id: string;
  userId: string;
  dailyGoals: Task[];
  weeklyGoals: Task[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface DiagnosticResult {
  score: number;
  subjectScores: Record<string, { correct: number; total: number }>;
  weakAreas: string[];
  learningProfile: {
    learningStyle: string;
    weakAreas: string[];
  };
  studyPlan: StudyPlan;
}

interface PerformanceData {
  subjectAverages: Record<string, { averageScore: number; totalStudyTime: number }>;
  overallAverage: number;
  dailyProgress: Array<{ date: string; averageScore: number }>;
  examAttempts: any[];
  totalStudyTime: number;
}

// Define study context interface
interface StudyContextType {
  studyPlan: StudyPlan | null;
  diagnosticResult: DiagnosticResult | null;
  performanceData: PerformanceData | null;
  loading: boolean;
  error: string | null;
  fetchStudyPlan: () => Promise<void>;
  updateStudyPlan: (dailyGoals?: Task[], weeklyGoals?: Task[], progress?: number) => Promise<void>;
  generateAdaptiveStudyPlan: () => Promise<void>;
  submitDiagnosticTest: (answers: any[], learningStyle: string) => Promise<void>;
  fetchPerformanceData: (subject?: string, startDate?: string, endDate?: string) => Promise<void>;
  clearError: () => void;
  resetDiagnosticResult: () => void;
}

// Create study context
const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Create study provider component
export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch study plan when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStudyPlan();
    }
  }, [isAuthenticated]);

  // Fetch study plan
  const fetchStudyPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/studyplan`);
      setStudyPlan(response.data);
      setError(null);
    } catch (err: any) {
      // Study plan might not exist yet, so this isn't a critical error
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to fetch study plan');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update study plan
  const updateStudyPlan = async (dailyGoals?: Task[], weeklyGoals?: Task[], progress?: number) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/studyplan/update`, {
        dailyGoals,
        weeklyGoals,
        progress,
      });
      setStudyPlan(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update study plan');
    } finally {
      setLoading(false);
    }
  };

  // Generate adaptive study plan
  const generateAdaptiveStudyPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/studyplan/generate`);
      setStudyPlan(response.data.studyPlan);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  // Submit diagnostic test
  const submitDiagnosticTest = async (answers: any[], learningStyle: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/diagnostic/submit`, {
        answers,
        learningStyle,
      });
      setDiagnosticResult(response.data);
      setStudyPlan(response.data.studyPlan);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit diagnostic test');
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance data
  const fetchPerformanceData = async (subject?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      let url = `${API_URL}/performance`;
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setPerformanceData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Reset diagnostic result
  const resetDiagnosticResult = () => {
    setDiagnosticResult(null);
  };

  return (
    <StudyContext.Provider
      value={{
        studyPlan,
        diagnosticResult,
        performanceData,
        loading,
        error,
        fetchStudyPlan,
        updateStudyPlan,
        generateAdaptiveStudyPlan,
        submitDiagnosticTest,
        fetchPerformanceData,
        clearError,
        resetDiagnosticResult,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

// Create hook for using study context
export const useStudy = (): StudyContextType => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}; 