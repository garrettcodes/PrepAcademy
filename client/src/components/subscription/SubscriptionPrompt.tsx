import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubscriptionPlans, SubscriptionPlan } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';

interface SubscriptionPromptProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ 
  onClose, 
  showCloseButton = true 
}) => {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { trialDaysLeft, isTrialActive } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptionPlans();
        setPlans(data.plans);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching subscription plans:', error);
        setError(error.message || 'Failed to fetch subscription plans');
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleNavigateToPricing = () => {
    navigate('/pricing');
  };

  // Only show the top plan in the prompt
  const featuredPlan = plans.quarterly || plans.annual || plans.monthly;

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-xl p-6 max-w-lg mx-auto">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
        <div className="h-10 bg-blue-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const trialMessage = isTrialActive && trialDaysLeft !== null && trialDaysLeft <= 2
    ? `Your free trial ends in ${trialDaysLeft === 0 ? 'less than a day' : `${trialDaysLeft} ${trialDaysLeft === 1 ? 'day' : 'days'}`}!`
    : 'Your free trial has ended!';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{trialMessage}</h2>
          <p className="mt-2 text-gray-600">
            Don't lose access to all the premium features that will help you succeed on your exam.
          </p>
        </div>

        {featuredPlan && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <h3 className="font-semibold text-lg text-blue-800">{featuredPlan.name} - {featuredPlan.price}</h3>
            <p className="text-sm text-blue-700 mt-1">{featuredPlan.description}</p>
            <ul className="mt-3 space-y-2">
              {featuredPlan.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-700">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleNavigateToPricing}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Plans
          </button>
          
          <div className="text-center">
            <Link 
              to="/contact" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Have questions? Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPrompt; 