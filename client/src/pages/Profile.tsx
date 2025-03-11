import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Card from '../components/ui/Card';
import PointsBadge from '../components/ui/PointsBadge';
import BadgeDisplay from '../components/ui/BadgeDisplay';
import { getUserBadges } from '../services/badgeService';
import { createCustomerPortal } from '../services/subscriptionService';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionStatus, isSubscribed, isTrialActive, trialDaysLeft } = useSubscription();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const userBadges = await getUserBadges();
        setBadges(userBadges);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load your badges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleOpenCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      
      // Current URL as return URL (or you could set a specific page)
      const returnUrl = `${window.location.origin}/profile`;
      const { url } = await createCustomerPortal(returnUrl);
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      setPortalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500">Please log in to view your profile.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
              <span className="text-5xl text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6">{user.name}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Learning Style</span>
                <span className="font-medium capitalize">{user.learningStyle}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Target Score</span>
                <span className="font-medium">{user.targetScore}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Points</span>
                <PointsBadge points={user.points || 0} />
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Test Date</span>
                <span className="font-medium">
                  {new Date(user.testDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges card */}
        <div className="lg:col-span-2">
          <BadgeDisplay 
            badges={badges} 
            title="Your Achievements" 
            emptyMessage={
              loading 
                ? "Loading your badges..." 
                : error 
                  ? error 
                  : "No badges earned yet. Keep practicing to earn achievements!"
            }
          />
          
          {badges.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline">View All Badges</Button>
            </div>
          )}
        </div>
      </div>

      {/* Billing section */}
      <div className="mt-8">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Subscription & Billing</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b">
                <span className="text-gray-600 mb-2 sm:mb-0">Current Plan</span>
                <div>
                  {subscriptionStatus === 'active' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active Subscription
                    </span>
                  )}
                  {subscriptionStatus === 'trial' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Trial Period ({trialDaysLeft} days left)
                    </span>
                  )}
                  {subscriptionStatus === 'canceled' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Canceled
                    </span>
                  )}
                  {subscriptionStatus === 'expired' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  )}
                  {subscriptionStatus === 'none' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Subscription
                    </span>
                  )}
                </div>
              </div>
              
              <div className="py-4">
                <div className="mb-4">
                  <p className="text-gray-700 font-medium">Manage your subscription or upgrade to a different plan</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isSubscribed ? 'Update your billing information or change your subscription plan.' : 
                     isTrialActive ? 'Your free trial is active. Subscribe to continue after your trial ends.' : 
                     'Subscribe to access premium features.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isSubscribed && (
                    <button
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      className={`w-full sm:w-auto px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                        ${portalLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'border-blue-500 text-blue-700 bg-white hover:bg-blue-50'}`}
                    >
                      {portalLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : 'Billing Portal'}
                    </button>
                  )}
                  <Link to="/subscription/manage" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full">Manage Subscription</Button>
                  </Link>
                  <Link to="/pricing" className="w-full sm:w-auto">
                    <Button variant={isSubscribed ? "outline" : "primary"} className="w-full">
                      {isSubscribed ? 'Change Plan' : 'View Plans'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 