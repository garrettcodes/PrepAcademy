import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubscriptionPlans, createSubscription, SubscriptionPlan } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showFeatures, setShowFeatures] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();
  const { isSubscribed, isTrialActive, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptionPlans();
        setPlans(data.plans);
        
        // Initialize features visibility state
        const featuresState: Record<string, boolean> = {};
        Object.keys(data.plans).forEach(key => {
          featuresState[key] = false;
        });
        setShowFeatures(featuresState);
        
        // Set default selected plan
        if (data.plans.monthly) {
          setSelectedPlan('monthly');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching subscription plans:', error);
        setError(error.message || 'Failed to fetch subscription plans');
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planType: string) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setSubscribing(planType);
      const { checkoutUrl } = await createSubscription(planType);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      setError(error.message || 'Failed to create subscription');
      setSubscribing(null);
    }
  };

  const toggleFeatures = (planKey: string) => {
    setShowFeatures(prev => ({
      ...prev,
      [planKey]: !prev[planKey]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded mx-auto max-w-md"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto max-w-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Plans</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This handles the case where there are no plans
  if (Object.keys(plans).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Subscription Plans Available</h2>
            <p className="text-gray-600 mb-6">Please check back later for subscription options.</p>
            <Link
              to="/dashboard"
              className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const planKeys = Object.keys(plans);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Choose Your Subscription Plan
          </h1>
          
          <p className="mt-5 text-xl text-gray-500">
            Select the plan that's right for your test preparation needs
          </p>
          
          {isTrialActive && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Trial Active:</span> You have {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left in your free trial.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isSubscribed && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Already Subscribed:</span> You already have an active subscription. You can manage your plan in your account settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plan Selection Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
            {planKeys.map((key) => (
              <button
                key={`tab-${plans[key].id}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedPlan === plans[key].id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedPlan(plans[key].id)}
              >
                {plans[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-y-8 sm:gap-y-0 sm:grid-cols-3 sm:gap-x-8">
          {planKeys.map((key) => (
            <div 
              key={plans[key].id}
              className={`relative rounded-2xl transition-all duration-300 transform ${
                selectedPlan === plans[key].id 
                  ? 'scale-105 bg-white border-2 border-blue-500 shadow-xl ring-4 ring-blue-100 z-10' 
                  : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300'
              }`}
            >
              {plans[key].popular && (
                <div className={`absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 rounded-full px-4 py-1 text-sm font-semibold tracking-wide text-white shadow-md transform transition-all duration-300 ${
                  selectedPlan === plans[key].id ? 'scale-110' : ''
                }`}>
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plans[key].name}</h3>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">{plans[key].price}</span>
                    <span className="ml-1 text-xl font-semibold">/{plans[key].billingPeriod}</span>
                  </p>
                  <p className="mt-2 text-sm text-gray-500">{plans[key].description}</p>

                  <ul role="list" className={`mt-6 space-y-4 ${!showFeatures[key] && 'max-h-[200px] overflow-hidden'}`}>
                    {plans[key].features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3 text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plans[key].features.length > 5 && (
                    <button 
                      onClick={() => toggleFeatures(key)}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                    >
                      {showFeatures[key] ? 'Show Less' : 'Show All Features'}
                    </button>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plans[key].id)}
                    disabled={isSubscribed || subscribing !== null}
                    className={`relative w-full py-3 px-6 border border-transparent rounded-md shadow text-center text-white font-medium 
                      transition-all duration-200
                      ${plans[key].popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-800 hover:bg-gray-900'
                      } 
                      ${isSubscribed || subscribing !== null ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      ${plans[key].popular ? 'focus:ring-blue-500' : 'focus:ring-gray-500'}`}
                  >
                    {subscribing === plans[key].id ? (
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : isSubscribed ? (
                      'Already Subscribed'
                    ) : (
                      `Subscribe to ${plans[key].name}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription FAQs</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Can I cancel my subscription?</h3>
                <p className="mt-2 text-sm text-gray-500">Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.</p>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-sm text-gray-500">We accept all major credit cards including Visa, Mastercard, American Express, and Discover.</p>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">How do I change my subscription plan?</h3>
                <p className="mt-2 text-sm text-gray-500">You can upgrade or downgrade your subscription at any time through your account settings.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Link to="/help/subscription" className="text-blue-600 hover:text-blue-800 font-medium">
              View all subscription FAQs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 