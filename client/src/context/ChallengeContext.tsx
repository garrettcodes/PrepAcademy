import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Reward {
  points: number;
  badgeId?: string;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'questions' | 'exams' | 'studyTime' | 'performance';
  target: number;
  reward: Reward;
  startDate: string;
  endDate: string;
  isActive: boolean;
  userProgress: number;
  isCompleted: boolean;
  isRewarded: boolean;
  participationId: string | null;
}

interface ChallengeParticipation {
  _id: string;
  user: string;
  challenge: Challenge;
  progress: number;
  isCompleted: boolean;
  completedDate?: string;
  isRewarded: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChallengeContextType {
  activeChallenges: Challenge[];
  userChallenges: ChallengeParticipation[];
  loading: boolean;
  error: string | null;
  fetchActiveChallenges: () => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<boolean>;
}

const ChallengeContext = createContext<ChallengeContextType | null>(null);

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeParticipation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuth();
  
  const fetchActiveChallenges = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/challenges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setActiveChallenges(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch active challenges. Please try again later.'
      );
      console.error('Error fetching active challenges:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserChallenges = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/challenges/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUserChallenges(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch user challenges. Please try again later.'
      );
      console.error('Error fetching user challenges:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const joinChallenge = async (challengeId: string) => {
    if (!token) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/challenges/${challengeId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Refresh challenges after joining
      await fetchActiveChallenges();
      await fetchUserChallenges();
      
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to join challenge. Please try again later.'
      );
      console.error('Error joining challenge:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchActiveChallenges();
      fetchUserChallenges();
    }
  }, [token]);
  
  return (
    <ChallengeContext.Provider
      value={{
        activeChallenges,
        userChallenges,
        loading,
        error,
        fetchActiveChallenges,
        fetchUserChallenges,
        joinChallenge,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export default ChallengeContext; 