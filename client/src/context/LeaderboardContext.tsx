import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface LeaderboardEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    points: number;
  };
  score: number;
  rank: number;
  category: string;
}

interface UserRank {
  rank: number;
  score: number;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank: UserRank | null;
  pagination: Pagination;
}

interface LeaderboardContextType {
  leaderboardData: LeaderboardData | null;
  loading: boolean;
  error: string | null;
  fetchLeaderboard: (category?: string, limit?: number, page?: number) => Promise<void>;
  currentCategory: string;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
}

const LeaderboardContext = createContext<LeaderboardContextType | null>(null);

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('points');
  
  const { token } = useAuth();
  
  const fetchLeaderboard = async (
    category: string = currentCategory,
    limit: number = 10,
    page: number = 1
  ) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const skip = (page - 1) * limit;
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          category,
          limit,
          skip,
        },
      });
      
      setLeaderboardData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch leaderboard data. Please try again later.'
      );
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchLeaderboard();
    }
  }, [token, currentCategory]);
  
  return (
    <LeaderboardContext.Provider
      value={{
        leaderboardData,
        loading,
        error,
        fetchLeaderboard,
        currentCategory,
        setCurrentCategory,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export default LeaderboardContext; 