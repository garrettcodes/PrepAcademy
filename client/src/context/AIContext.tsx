import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define interfaces
interface Recommendation {
  recommendations: string[];
}

// Define AI context interface
interface AIContextType {
  hint: string | null;
  explanation: string | null;
  recommendations: string[];
  loading: boolean;
  error: string | null;
  getHint: (questionId: string, hintIndex?: number) => Promise<void>;
  getExplanation: (questionId: string) => Promise<void>;
  getRecommendations: (subject?: string) => Promise<void>;
  clearHint: () => void;
  clearExplanation: () => void;
  clearError: () => void;
}

// Create AI context
const AIContext = createContext<AIContextType | undefined>(undefined);

// Create AI provider component
export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Get a hint for a question
  const getHint = async (questionId: string, hintIndex?: number) => {
    if (!isAuthenticated) {
      setError('You must be logged in to get hints');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/ai/hint`, {
        questionId,
        hintIndex,
      });
      
      setHint(response.data.hint);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  // Get an explanation for a question
  const getExplanation = async (questionId: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to get explanations');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/ai/explanation`, {
        questionId,
      });
      
      setExplanation(response.data.explanation);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  // Get personalized study recommendations
  const getRecommendations = async (subject?: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to get recommendations');
      return;
    }

    try {
      setLoading(true);
      
      const requestData: any = {};
      if (subject) {
        requestData.subject = subject;
      }
      
      const response = await axios.post<Recommendation>(`${API_URL}/ai/recommendations`, requestData);
      
      setRecommendations(response.data.recommendations);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Clear hint
  const clearHint = () => {
    setHint(null);
  };

  // Clear explanation
  const clearExplanation = () => {
    setExplanation(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AIContext.Provider
      value={{
        hint,
        explanation,
        recommendations,
        loading,
        error,
        getHint,
        getExplanation,
        getRecommendations,
        clearHint,
        clearExplanation,
        clearError,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

// Create hook for using AI context
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 