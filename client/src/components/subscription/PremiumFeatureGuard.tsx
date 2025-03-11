import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import SubscriptionPrompt from './SubscriptionPrompt';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const { isSubscribed, isTrialActive, isLoading } = useSubscription();
  const navigate = useNavigate();

  // While loading subscription status, show loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only subscribed users can access premium features
  // Trial users cannot access premium features
  if (isSubscribed) {
    return <>{children}</>;
  }

  // If prompt is currently shown, render it
  if (showPrompt) {
    return (
      <SubscriptionPrompt onClose={() => setShowPrompt(false)} />
    );
  }

  // If fallback UI is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise show a default limited access message with buttons
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {isTrialActive 
              ? "This is a premium feature not available during the free trial. Subscribe to access." 
              : "This is a premium feature. Subscribe to access all features and enhance your prep experience."}
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => setShowPrompt(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              View Plans
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureGuard; 