import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Badge type
interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

// Question context type
interface QuestionContextType {
  submitAnswer: (questionId: string, selectedAnswer: string, timeSpent: number) => Promise<any>;
  newlyEarnedBadges: Badge[];
  clearNewBadges: () => void;
  loading: boolean;
  error: string | null;
}

// Create question context
const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// Export the context itself
export { QuestionContext };

// Question Provider component
export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);

  // Submit an answer to a question
  const submitAnswer = async (questionId: string, selectedAnswer: string, timeSpent: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/questions/answer`, {
        questionId,
        selectedAnswer,
        timeSpent,
      });

      // Check if any badges were earned
      if (response.data.earnedBadges && response.data.earnedBadges.length > 0) {
        setNewlyEarnedBadges(response.data.earnedBadges);
      }

      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error submitting answer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear newly earned badges
  const clearNewBadges = () => {
    setNewlyEarnedBadges([]);
  };

  return (
    <QuestionContext.Provider
      value={{
        submitAnswer,
        newlyEarnedBadges,
        clearNewBadges,
        loading,
        error,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

// Question context hook
export const useQuestion = (): QuestionContextType => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}; 