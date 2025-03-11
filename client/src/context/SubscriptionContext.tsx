import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription, SubscriptionStatus } from '../services/subscriptionService';
import { useAuth } from './AuthContext';

interface SubscriptionContextProps {
  subscriptionStatus: string;
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number | null;
  isLoading: boolean;
  error: string | null;
  fetchSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  const fetchSubscriptionStatus = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data: SubscriptionStatus = await getCurrentSubscription();
      setSubscriptionStatus(data.subscriptionStatus);
      
      // Calculate trial days left if in trial
      if (data.subscriptionStatus === 'trial' && data.trialEndDate) {
        const trialEnd = new Date(data.trialEndDate);
        const now = new Date();
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(daysLeft > 0 ? daysLeft : 0);
      } else {
        setTrialDaysLeft(null);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      setError(error.message || 'Failed to fetch subscription status');
      setIsLoading(false);
      
      // If unauthorized, redirect to login
      if (error.message === 'Unauthorized') {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const isSubscribed = subscriptionStatus === 'active';
  const isTrialActive = subscriptionStatus === 'trial';

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        isSubscribed,
        isTrialActive,
        trialDaysLeft,
        isLoading,
        error,
        fetchSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextProps => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 