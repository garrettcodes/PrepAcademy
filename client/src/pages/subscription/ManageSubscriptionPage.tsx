import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import { cancelSubscription, getSubscriptionPlans, createSubscription, createCustomerPortal, SubscriptionPlan } from '../../services/subscriptionService';
import { getMockUserUsageStats, UserUsageStats } from '../../services/userStatsService';
import UsageStatsCard from '../../components/subscription/UsageStatsCard';

const ManageSubscriptionPage: React.FC = () => {
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [plansLoading, setPlansLoading] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState<UserUsageStats | null>(null);
  const [usageStatsLoading, setUsageStatsLoading] = useState<boolean>(false);
  const [usageStatsError, setUsageStatsError] = useState<string | null>(null);
  const { subscriptionStatus, isSubscribed, isTrialActive, trialDaysLeft, isLoading, fetchSubscriptionStatus } = useSubscription();
  const navigate = useNavigate();

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const data = await getSubscriptionPlans();
        setPlans(data.plans);
        setPlansLoading(false);
      } catch (error: any) {
        console.error('Error fetching subscription plans:', error);
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch usage statistics
  useEffect(() => {
    const fetchUsageStats = async () => {
      if (isSubscribed || isTrialActive) {
        try {
          setUsageStatsLoading(true);
          // In production, use the real service instead of the mock:
          // const stats = await getUserUsageStats();
          const stats = await getMockUserUsageStats();
          setUsageStats(stats);
          setUsageStatsLoading(false);
        } catch (error: any) {
          console.error('Error fetching usage stats:', error);
          setUsageStatsError(error.message || 'Failed to load usage statistics');
          setUsageStatsLoading(false);
        }
      }
    };

    fetchUsageStats();
  }, [isSubscribed, isTrialActive]);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setCancelError(null);
      
      await cancelSubscription();
      
      // Refresh subscription status
      await fetchSubscriptionStatus();
      
      setCancelLoading(false);
      setShowConfirmCancel(false);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      setCancelError(error.message || 'Failed to cancel subscription');
      setCancelLoading(false);
    }
  };

  const handleUpgrade = async (planType: string) => {
    try {
      setUpgrading(planType);
      const { checkoutUrl } = await createSubscription(planType);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      setUpgrading(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      setPortalError(null);
      
      // Current URL as return URL (or you could set a specific page)
      const returnUrl = `${window.location.origin}/subscription/manage`;
      const { url } = await createCustomerPortal(returnUrl);
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      setPortalError(error.message || 'Failed to open customer portal');
      setPortalLoading(false);
    }
  };

  if (isLoading || plansLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Function to get current plan information
  const getCurrentPlanInfo = () => {
    // Here you would normally get this from the user's current subscription data
    // For this example, we'll just return a placeholder
    return {
      name: 'Premium Subscription',
      billingPeriod: subscriptionStatus === 'active' ? 'Monthly / Quarterly / Annual' : 'None',
      nextBillingDate: 'June 15, 2023',
    };
  };

  const currentPlan = getCurrentPlanInfo();

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Manage Your Subscription
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            View and manage your PrepAcademy subscription details.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Subscription Information</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about your current subscription.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Subscription Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscriptionStatus === 'active' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                  {subscriptionStatus === 'trial' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Trial
                    </span>
                  )}
                  {subscriptionStatus === 'canceled' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Canceled
                    </span>
                  )}
                  {subscriptionStatus === 'expired' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  )}
                  {subscriptionStatus === 'none' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Subscription
                    </span>
                  )}
                </dd>
              </div>
              
              {isTrialActive && trialDaysLeft !== null && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Trial Period</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} remaining
                  </dd>
                </div>
              )}
              
              {isSubscribed && (
                <>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                      {currentPlan.name}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Billing Period</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPlan.billingPeriod}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPlan.nextBillingDate}
                    </dd>
                  </div>
                </>
              )}
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Features</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">Unlimited practice questions</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">Full-length practice exams</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">Performance analytics</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">Study groups</span>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Usage Statistics Section */}
        {(isSubscribed || isTrialActive) && (
          <div className="mt-8">
            <UsageStatsCard 
              stats={usageStats} 
              loading={usageStatsLoading} 
              error={usageStatsError} 
            />
          </div>
        )}

        {/* Change Plan Section */}
        {isSubscribed && (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Change Your Plan</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Switch to a different billing frequency.</p>
                </div>
                <button
                  onClick={() => setUpgrading(null)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(plans).map((key) => (
                      <div 
                        key={plans[key].id}
                        className={`relative border rounded-lg p-4 hover:border-blue-500 transition-colors
                          ${(plans[key].id === 'monthly' && currentPlan.billingPeriod.toLowerCase().includes('month') && !currentPlan.billingPeriod.toLowerCase().includes('3')) ||
                            (plans[key].id === 'quarterly' && currentPlan.billingPeriod.toLowerCase().includes('quarter')) ||
                            (plans[key].id === 'annual' && currentPlan.billingPeriod.toLowerCase().includes('annual'))
                              ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{plans[key].name}</h3>
                          <p className="text-sm text-gray-500">{plans[key].billingPeriod}</p>
                        </div>
                        <div className="mb-4">
                          <span className="text-2xl font-bold">{plans[key].price}</span>
                        </div>
                        <button
                          onClick={() => handleUpgrade(plans[key].id)}
                          disabled={upgrading !== null || (
                            (plans[key].id === 'monthly' && currentPlan.billingPeriod.toLowerCase().includes('month') && !currentPlan.billingPeriod.toLowerCase().includes('3')) ||
                            (plans[key].id === 'quarterly' && currentPlan.billingPeriod.toLowerCase().includes('quarter')) ||
                            (plans[key].id === 'annual' && currentPlan.billingPeriod.toLowerCase().includes('annual'))
                          )}
                          className={`w-full py-2 px-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                            ${upgrading === plans[key].id 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : (plans[key].id === 'monthly' && currentPlan.billingPeriod.toLowerCase().includes('month') && !currentPlan.billingPeriod.toLowerCase().includes('3')) ||
                                (plans[key].id === 'quarterly' && currentPlan.billingPeriod.toLowerCase().includes('quarter')) ||
                                (plans[key].id === 'annual' && currentPlan.billingPeriod.toLowerCase().includes('annual'))
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                          {upgrading === plans[key].id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>) : (
                            (plans[key].id === 'monthly' && currentPlan.billingPeriod.toLowerCase().includes('month') && !currentPlan.billingPeriod.toLowerCase().includes('3')) ||
                            (plans[key].id === 'quarterly' && currentPlan.billingPeriod.toLowerCase().includes('quarter')) ||
                            (plans[key].id === 'annual' && currentPlan.billingPeriod.toLowerCase().includes('annual'))
                              ? 'Current Plan'
                              : 'Switch to this Plan'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Changing plans will be effective immediately. You'll be charged the new rate, with credit for any remaining time on your current plan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Subscription Actions */}
        {isSubscribed && (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Manage Your Subscription</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Change your plan, update payment methods, or view billing history.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">Stripe Customer Portal</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your subscription details, payment methods, view invoices, and update your billing information.
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <button
                          onClick={handleOpenCustomerPortal}
                          disabled={portalLoading}
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            portalLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
                        >
                          {portalLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Opening Portal...
                            </>
                          ) : 'Manage Billing Details'}
                        </button>
                      </div>
                    </div>
                    {portalError && (
                      <div className="mt-2 text-sm text-red-600">
                        {portalError}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900">Cancel Subscription</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                    </p>
                    <div className="mt-3">
                      {!showConfirmCancel ? (
                        <button
                          onClick={() => setShowConfirmCancel(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Subscription
                        </button>
                      ) : (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Are you sure you want to cancel your subscription?</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>
                                  You will still have access to premium features until the end of your current billing period. After that, your access will be restricted.
                                </p>
                              </div>
                              <div className="mt-4 flex space-x-3">
                                <button
                                  onClick={handleCancelSubscription}
                                  disabled={cancelLoading}
                                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                                    cancelLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                  } text-white`}
                                >
                                  {cancelLoading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Processing...
                                    </>
                                  ) : (
                                    'Yes, Cancel Subscription'
                                  )}
                                </button>
                                <button
                                  onClick={() => setShowConfirmCancel(false)}
                                  disabled={cancelLoading}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                  No, Keep Subscription
                                </button>
                              </div>
                              {cancelError && (
                                <div className="mt-2 text-sm text-red-600">
                                  {cancelError}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </Link>
          
          {!isSubscribed && !isTrialActive && (
            <Link
              to="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-4"
            >
              View Subscription Plans
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptionPage; 