import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { usePractice } from '../context/PracticeContext';
import { usePerformance } from '../context/PerformanceContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useSubscription } from '../context/SubscriptionContext';
import PointsBadge from '../components/ui/PointsBadge';
import PerformanceChart from '../components/charts/PerformanceChart';
import Badge from '../components/ui/Badge';
import LeaderboardWidget from '../components/ui/LeaderboardWidget';
import ChallengeWidget from '../components/ui/ChallengeWidget';
import StressManagementWidget from '../components/ui/StressManagementWidget';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, miniAssessmentDue, nextMiniAssessmentDate } = useAuth();
  const { studyPlan, fetchStudyPlan, loading: studyLoading } = useStudy();
  const { fetchExams, exams, loading: examLoading } = usePractice();
  const { fetchPerformanceSummary, performanceSummary, loading: performanceLoading } = usePerformance();
  const { isOnboardingCompleted, isLoading: onboardingLoading } = useOnboarding();
  const { subscriptionStatus, isSubscribed, isTrialActive, trialDaysLeft, isLoading: subscriptionLoading } = useSubscription();
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState<boolean>(false);

  // Check for subscription success message from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('subscription') === 'success') {
      setShowSubscriptionSuccess(true);
      // Clear the query parameter
      navigate(location.pathname, { replace: true });
      
      // Hide the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSubscriptionSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.search, navigate, location.pathname]);

  // Check onboarding status and redirect if not completed
  useEffect(() => {
    if (!onboardingLoading && !isOnboardingCompleted) {
      navigate('/onboarding');
    }
  }, [isOnboardingCompleted, onboardingLoading, navigate]);

  // Fetch data on component mount
  useEffect(() => {
    fetchStudyPlan();
    fetchExams();
    fetchPerformanceSummary();
  }, [fetchStudyPlan, fetchExams, fetchPerformanceSummary]);

  // Calculate days until test
  const getDaysUntilTest = () => {
    if (!user?.testDate) return null;
    
    const today = new Date();
    const testDate = new Date(user.testDate);
    const diffTime = Math.abs(testDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // If onboarding is still loading or not completed, show loading state
  if (onboardingLoading || (!onboardingLoading && !isOnboardingCompleted)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">
            {getDaysUntilTest() ? `${getDaysUntilTest()} days until your exam` : 'Set your exam date in settings'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <PointsBadge points={user?.points || 0} />
        </div>
      </div>

      {/* Subscription Success Message */}
      {showSubscriptionSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your subscription was successful! You now have full access to all premium features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status Card */}
      {!subscriptionLoading && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Subscription Status</h2>
              <div className="mt-2">
                {isSubscribed && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                      Active
                    </span>
                    <p className="text-sm text-gray-600">You have full access to all premium features.</p>
                  </div>
                )}
                
                {isTrialActive && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      Trial
                    </span>
                    <p className="text-sm text-gray-600">
                      You have {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left in your free trial.
                    </p>
                  </div>
                )}
                
                {!isSubscribed && !isTrialActive && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                      {subscriptionStatus === 'canceled' ? 'Canceled' : 'Inactive'}
                    </span>
                    <p className="text-sm text-gray-600">Some features may be limited. Subscribe to unlock all features.</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              {isSubscribed || isTrialActive ? (
                <Link
                  to="/subscription/manage"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Subscription
                </Link>
              ) : (
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Plans
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main dashboard grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Points and badges card */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Achievements
          </h2>
          <div className="flex items-center mb-4">
            <PointsBadge points={user?.points || 0} size="lg" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-800">{user?.points || 0}</div>
              <div className="text-sm text-gray-500">Total points earned</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">Badges</div>
              <Link to="/profile" className="text-sm text-indigo-600 hover:text-indigo-800">
                View all
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.badges && user.badges.length > 0 ? (
                user.badges.slice(0, 3).map((badge: any) => (
                  <Badge
                    key={badge._id}
                    name={badge.name}
                    description={badge.description}
                    icon={badge.icon}
                    size="sm"
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500 py-2">
                  No badges earned yet. Keep studying to earn badges!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study plan progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Study Plan
            </h2>
            <Link to="/study-plan" className="text-sm text-indigo-600 hover:text-indigo-800">
              View plan
            </Link>
          </div>
          
          {studyLoading ? (
            <div className="text-center py-4">
              <div className="spinner"></div>
            </div>
          ) : studyPlan ? (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${studyPlan.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {studyPlan.progress || 0}%
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Upcoming Tasks</div>
                {studyPlan.dailyGoals && studyPlan.dailyGoals.length > 0 ? (
                  <ul className="space-y-2">
                    {studyPlan.dailyGoals
                      .filter(goal => goal.status !== 'completed')
                      .slice(0, 3)
                      .map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2"></span>
                          <div className="text-sm text-gray-700">{goal.task}</div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 py-2">
                    No upcoming tasks
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                No study plan found.
              </p>
              <Link 
                to="/diagnostic"
                className="mt-2 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Take Diagnostic Test
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <LeaderboardWidget />
          <ChallengeWidget />
          <StressManagementWidget />
        </div>

        {/* Recent performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Performance
            </h2>
            <Link to="/performance" className="text-sm text-indigo-600 hover:text-indigo-800">
              Full metrics
            </Link>
          </div>
          
          {performanceLoading ? (
            <div className="text-center py-4">
              <div className="spinner"></div>
            </div>
          ) : performanceSummary && performanceSummary.recentScores && performanceSummary.recentScores.length > 0 ? (
            <>
              <div className="h-40 mb-4">
                <PerformanceChart 
                  data={{
                    labels: performanceSummary.recentScores.map(score => score.date),
                    datasets: [
                      {
                        label: 'Scores',
                        data: performanceSummary.recentScores.map(score => score.score),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                      },
                    ],
                  }}
                />
              </div>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-lg font-bold text-gray-800">
                    {performanceSummary.averageScore || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Average Score
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">
                    {performanceSummary.questionsAnswered || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Questions Answered
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">
                    {performanceSummary.studyTimeHours || 0}h
                  </div>
                  <div className="text-xs text-gray-500">
                    Study Time
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                No performance data yet.
              </p>
              <Link 
                to="/practice"
                className="mt-2 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Start Practicing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 