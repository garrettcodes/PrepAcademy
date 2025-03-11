import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { confirmSubscription } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';

const SubscriptionSuccessPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchSubscriptionStatus } = useSubscription();
  
  useEffect(() => {
    const confirmAndRedirect = async () => {
      try {
        // Get session ID from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');
        const planType = queryParams.get('plan') || 'Premium';
        
        setPlan(planType.charAt(0).toUpperCase() + planType.slice(1));
        
        if (!sessionId) {
          // If no session ID, redirect to dashboard
          navigate('/dashboard');
          return;
        }
        
        setLoading(true);
        
        // Start progress animation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);
        
        // Confirm the subscription with the backend
        await confirmSubscription(sessionId);
        
        // Refresh subscription status in context
        await fetchSubscriptionStatus();
        
        // Complete progress bar
        setProgress(100);
        
        setLoading(false);
        
        // After a short delay, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { state: { subscriptionSuccess: true } });
        }, 3000);
        
        return () => clearInterval(progressInterval);
      } catch (error: any) {
        console.error('Error confirming subscription:', error);
        setError(error.message || 'Failed to confirm subscription');
        setLoading(false);
        setProgress(0);
      }
    };
    
    confirmAndRedirect();
  }, [location.search, navigate, fetchSubscriptionStatus]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center border border-blue-100">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Your Subscription
            </h2>
            
            <p className="text-md text-gray-600 mb-6">
              Please wait while we confirm your {plan} subscription.
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">
              This will only take a few moments...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center border border-red-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Processing Error
            </h2>
            
            <p className="text-md text-gray-600 mb-6">
              We couldn't process your subscription. Please try again.
            </p>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </Link>
              <Link
                to="/help/contact"
                className="inline-flex justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center border border-green-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You For Subscribing!
          </h2>
          
          <p className="text-md text-gray-600 mb-6">
            Your {plan} subscription is now active. Enjoy full access to all PrepAcademy premium features.
          </p>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 text-left">
            <p className="text-sm text-green-700">
              A confirmation email has been sent to your registered email address with all your subscription details.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
            
            <Link
              to="/account/subscription"
              className="w-full inline-flex justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Manage My Subscription
            </Link>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            You will be redirected to your dashboard automatically in a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage; 