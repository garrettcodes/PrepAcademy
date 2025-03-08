import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { usePractice } from '../context/PracticeContext';
import { useAI } from '../context/AIContext';
import BadgeDisplay from '../components/ui/BadgeDisplay';
import PointsBadge from '../components/ui/PointsBadge';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { studyPlan, fetchStudyPlan, loading: studyLoading } = useStudy();
  const { fetchExams, exams, loading: examLoading } = usePractice();
  const { getRecommendations, recommendations, loading: aiLoading } = useAI();
  const [hasDiagnostic, setHasDiagnostic] = useState(false);

  // Fetch study plan and exams on mount
  useEffect(() => {
    fetchStudyPlan();
    fetchExams();
    getRecommendations();
    
    // Check if user has taken diagnostic test
    // For now, we'll consider having a study plan as evidence of taking the diagnostic
    setHasDiagnostic(!!studyPlan);
  }, [fetchStudyPlan, fetchExams, getRecommendations, studyPlan]);

  // Helper to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days until test date
  const getDaysUntilTest = () => {
    if (!user?.testDate) return null;
    
    const testDate = new Date(user.testDate);
    const today = new Date();
    const diffTime = testDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : null;
  };

  // Get upcoming study goals
  const getUpcomingGoals = () => {
    if (!studyPlan) return [];
    
    // Combine daily and weekly goals, prioritize incomplete ones
    const allGoals = [
      ...studyPlan.dailyGoals.map(goal => ({ ...goal, type: 'Daily' })),
      ...studyPlan.weeklyGoals.map(goal => ({ ...goal, type: 'Weekly' })),
    ].filter(goal => goal.status !== 'completed');
    
    // Return up to 3 goals
    return allGoals.slice(0, 3);
  };

  return (
    <div className="pb-12">
      {/* Welcome section */}
      <div className="bg-white shadow-sm rounded-lg mb-8 p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's an overview of your test preparation progress
            </p>
          </div>
          
          {getDaysUntilTest() && (
            <div className="mt-4 md:mt-0">
              <Badge variant="primary" className="text-sm">
                {getDaysUntilTest()} days until your test
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Diagnostic test card */}
        <Card
          title="Diagnostic Test"
          className={`${hasDiagnostic ? 'border-green-200' : 'border-yellow-200'}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {hasDiagnostic
                ? 'You have completed the diagnostic test. You can retake it anytime to update your learning profile.'
                : 'Take a diagnostic test to identify your strengths and weaknesses, and get a personalized study plan.'}
            </p>
            <div>
              <Link to="/diagnostic">
                <Button variant={hasDiagnostic ? 'outline' : 'primary'}>
                  {hasDiagnostic ? 'Retake Diagnostic' : 'Take Diagnostic Test'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Study plan card */}
        <Card
          title="Study Plan"
          className={`${studyPlan ? 'border-green-200' : 'border-gray-200'}`}
          headerAction={studyPlan && <Badge variant="success">{studyPlan.progress}% Complete</Badge>}
        >
          <div className="space-y-4">
            {studyLoading ? (
              <div className="py-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : studyPlan ? (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Upcoming Tasks</h4>
                  {getUpcomingGoals().length > 0 ? (
                    <ul className="space-y-2">
                      {getUpcomingGoals().map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-light text-primary text-xs mr-2">
                            {goal.type === 'Daily' ? 'D' : 'W'}
                          </span>
                          <span className="text-gray-700">{goal.task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">All tasks completed!</p>
                  )}
                </div>
                <div>
                  <Link to="/study-plan">
                    <Button variant="outline">View Full Study Plan</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="text-gray-600 mb-4">
                  You don't have a study plan yet. Take the diagnostic test to generate one.
                </p>
                <Link to="/diagnostic">
                  <Button>Take Diagnostic Test</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Practice exams card */}
        <Card title="Practice Exams">
          <div className="space-y-4">
            {examLoading ? (
              <div className="py-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : exams && exams.length > 0 ? (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Available Exams</h4>
                  <ul className="space-y-2">
                    {exams.slice(0, 3).map((exam) => (
                      <li key={exam._id} className="flex items-center justify-between">
                        <span className="text-gray-700">{exam.title}</span>
                        <Badge variant={exam.difficulty === 'easy' ? 'success' : exam.difficulty === 'hard' ? 'danger' : 'warning'}>
                          {exam.difficulty}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Link to="/exams">
                    <Button variant="outline">View All Exams</Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                Practice exams are being prepared for you. Check back soon or explore practice questions.
              </p>
            )}
          </div>
        </Card>

        {/* Practice questions card */}
        <Card title="Practice Questions">
          <div className="space-y-4">
            <p className="text-gray-600">
              Practice with unlimited questions to improve your skills and knowledge.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Link to="/practice">
                  <Button fullWidth>Practice Now</Button>
                </Link>
              </div>
              <div>
                <Link to="/performance">
                  <Button variant="outline" fullWidth>View Progress</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* AI recommendations card */}
        <Card title="Study Recommendations">
          <div className="space-y-4">
            {aiLoading ? (
              <div className="py-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recommendations.length > 0 ? (
              <ul className="space-y-2">
                {recommendations.slice(0, 3).map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-light text-primary text-xs mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">
                Complete the diagnostic test to get personalized recommendations.
              </p>
            )}
          </div>
        </Card>

        {/* User profile or learning profile card */}
        <Card title="Your Learning Profile">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Learning Style</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.learningStyle ? (
                  user.learningStyle.charAt(0).toUpperCase() + user.learningStyle.slice(1)
                ) : (
                  'Not set'
                )}
              </span>
            </div>
            <p className="text-gray-600">
              {user?.learningStyle === 'visual' && 'You learn best through visual aids like diagrams, charts, and videos.'}
              {user?.learningStyle === 'auditory' && 'You learn best through listening to lectures, discussions, and audio materials.'}
              {user?.learningStyle === 'kinesthetic' && 'You learn best through hands-on activities and interactive exercises.'}
              {user?.learningStyle === 'reading/writing' && 'You learn best through reading materials and writing notes.'}
              {!user?.learningStyle && 'Take the diagnostic test to determine your learning style.'}
            </p>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Points</h4>
              <PointsBadge points={user?.points || 0} />
            </div>
            <div>
              <Link to="/diagnostic">
                <Button variant="outline">Update Learning Profile</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Badges section */}
        {user && (
          <BadgeDisplay 
            badges={user.badges || []} 
            title="Your Achievements" 
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 