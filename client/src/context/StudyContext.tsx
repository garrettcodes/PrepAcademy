import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define interfaces
interface Task {
  _id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
}

interface Recommendation {
  subject: string;
  subtopics: string[];
  resources: string[];
  priority: string;
}

interface StudyPlan {
  _id: string;
  userId: string;
  dailyGoals: Task[];
  weeklyGoals: Task[];
  progress: number;
  weakAreas: string[];
  recommendations: Recommendation[];
  completedTopics: string[];
  overallProgress: number;
  learningStyleRecommendations: string[];
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
  _id: string;
  userId: string;
  subject: string;
  subtopic: string;
  score: number;
  studyTime: number;
  date: string;
}

// Define study context interface
interface StudyContextType {
  studyPlan: StudyPlan | null;
  diagnosticResult: DiagnosticResult | null;
  performanceData: PerformanceData[];
  loading: boolean;
  error: string | null;
  fetchStudyPlan: () => Promise<void>;
  updateStudyPlan: (data: Partial<StudyPlan>) => Promise<void>;
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
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch study plan
  const fetchStudyPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/studyplan`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStudyPlan(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch study plan');
      console.error('Fetch study plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update study plan
  const updateStudyPlan = async (data: Partial<StudyPlan>) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/studyplan/update`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setStudyPlan(response.data.studyPlan);
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
      const response = await axios.post(
        `${API_URL}/studyplan/generate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.studyPlan) {
        setStudyPlan(response.data.studyPlan);
      } else if (response.data.redirectTo) {
        // Handle redirect if needed
        console.log('Redirect to diagnostic test needed');
      }
      
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
      const response = await axios.post(
        `${API_URL}/diagnostic/submit`,
        {
          answers,
          learningStyle,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
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
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
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
export const useStudy = () => {
  const context = useContext(StudyContext);
  
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  
  return context;
}; 