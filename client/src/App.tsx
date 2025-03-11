import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ParentAuthProvider } from './context/ParentAuthContext';
import { ReportProvider } from './context/ReportContext';
import { QuestionProvider, useQuestion, QuestionContext } from './context/QuestionContext';
import { StudyProvider } from './context/StudyContext';
import { PracticeProvider } from './context/PracticeContext';
import { AIProvider } from './context/AIContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { LeaderboardProvider } from './context/LeaderboardContext';
import { ChallengeProvider } from './context/ChallengeContext';
import { OfflineProvider } from './context/OfflineContext';
import { StressManagementProvider } from './context/StressManagementContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Dashboard from './pages/Dashboard';
import DiagnosticTest from './pages/diagnostic/DiagnosticTest';
import MiniAssessment from './pages/diagnostic/MiniAssessment';
import StudyPlan from './pages/study/StudyPlan';
import PracticeQuestions from './pages/practice/PracticeQuestions';
import PracticeExams from './pages/practice/PracticeExams';
import ExamPage from './pages/practice/ExamPage';
import Performance from './pages/performance/Performance';
import Leaderboard from './pages/Leaderboard';
import Challenges from './pages/Challenges';
import StressManagement from './pages/StressManagement';
import StressManagementDetail from './pages/StressManagementDetail';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ParentLogin from './pages/parent/ParentLogin';
import ParentRegister from './pages/parent/ParentRegister';
import ParentDashboard from './pages/parent/ParentDashboard';
import StudentDetail from './pages/parent/StudentDetail';
import StudentReports from './pages/parent/StudentReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentReviews from './pages/admin/ContentReviews';
import ReviewDetail from './pages/admin/ReviewDetail';
import SATACTUpdates from './pages/admin/SATACTUpdates';
import NotFound from './pages/NotFound';
import BadgeNotification from './components/ui/BadgeNotification';
import AssessmentNotification from './components/ui/AssessmentNotification';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

// Social features and feedback pages
import StudyGroups from './pages/social/StudyGroups';
import CreateStudyGroupPage from './pages/social/CreateStudyGroupPage';
import StudyGroupDetailPage from './pages/social/StudyGroupDetailPage';
import SharedNotes from './pages/social/SharedNotes';
import FeedbackPage from './pages/feedback/FeedbackPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';

// Subscription Pages
import PricingPage from './pages/subscription/PricingPage';
import SubscriptionSuccessPage from './pages/subscription/SubscriptionSuccessPage';
import ManageSubscriptionPage from './pages/subscription/ManageSubscriptionPage';

// Define an interface for the User type that includes the role property
interface UserWithRole {
  _id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any; // For any other properties that may exist
}

// Private route component
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Simple loading state for authentication
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Once we have authentication status, update loading state
    setIsLoading(false);
  }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Root component that provides context to the app
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <OfflineProvider>
          <ParentAuthProvider>
            <ReportProvider>
              <QuestionProvider>
                <StudyProvider>
                  <PracticeProvider>
                    <AIProvider>
                      <PerformanceProvider>
                        <LeaderboardProvider>
                          <ChallengeProvider>
                            <StressManagementProvider>
                              <OnboardingProvider>
                                <SubscriptionProvider>
                                  <AppContent />
                                </SubscriptionProvider>
                              </OnboardingProvider>
                            </StressManagementProvider>
                          </ChallengeProvider>
                        </LeaderboardProvider>
                      </PerformanceProvider>
                    </AIProvider>
                  </PracticeProvider>
                </StudyProvider>
              </QuestionProvider>
            </ReportProvider>
          </ParentAuthProvider>
        </OfflineProvider>
      </AuthProvider>
    </Router>
  );
};

// Main app content with access to context values
const AppContent: React.FC = () => {
  const { isAuthenticated, miniAssessmentDue, user } = useAuth();
  const questionContext = useContext(QuestionContext);
  const newlyEarnedBadges = questionContext?.newlyEarnedBadges || [];
  const clearNewBadges = questionContext?.clearNewBadges || (() => {});
  const [showMiniAssessmentNotification, setShowMiniAssessmentNotification] = React.useState(false);

  // Show mini-assessment notification when due
  React.useEffect(() => {
    if (isAuthenticated && miniAssessmentDue) {
      setShowMiniAssessmentNotification(true);
    }
  }, [isAuthenticated, miniAssessmentDue]);

  // Check if user has admin or expert role
  const isAdminOrExpert = () => {
    const userWithRole = user as UserWithRole | null;
    return userWithRole && (userWithRole.role === 'admin' || userWithRole.role === 'expert');
  };

  return (
    <>
      {newlyEarnedBadges.length > 0 && (
        <BadgeNotification 
          badges={newlyEarnedBadges} 
          onClose={clearNewBadges} 
        />
      )}
      
      {showMiniAssessmentNotification && (
        <AssessmentNotification 
          onClose={() => setShowMiniAssessmentNotification(false)} 
        />
      )}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Subscription Routes */}
        <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription/manage" element={
          <PrivateRoute>
            <ManageSubscriptionPage />
          </PrivateRoute>
        } />
        <Route path="/subscription/cancel" element={
          <PrivateRoute>
            <Navigate to="/pricing?canceled=true" />
          </PrivateRoute>
        } />
        
        {/* Parent Portal Routes */}
        <Route path="/parent/login" element={<ParentLogin />} />
        <Route path="/parent/register" element={<ParentRegister />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/student/:studentId" element={<StudentDetail />} />
        <Route path="/parent/reports/:studentId" element={<StudentReports />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute>
            {isAdminOrExpert() ? <AdminDashboard /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
        <Route path="/admin/reviews" element={
          <PrivateRoute>
            {isAdminOrExpert() ? <ContentReviews /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
        <Route path="/admin/review/:reviewId" element={
          <PrivateRoute>
            {isAdminOrExpert() ? <ReviewDetail /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
        <Route path="/admin/sat-act-updates" element={
          <PrivateRoute>
            {isAdminOrExpert() ? <SATACTUpdates /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
        {/* New Admin Feedback Route */}
        <Route path="/admin/feedback" element={
          <PrivateRoute>
            {isAdminOrExpert() ? <AdminFeedbackPage /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />

        {/* Authenticated User Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Onboarding Route */}
        <Route path="/onboarding" element={
          <PrivateRoute>
            <OnboardingFlow />
          </PrivateRoute>
        } />
        
        <Route path="/diagnostic-test" element={
          <PrivateRoute>
            <DiagnosticTest />
          </PrivateRoute>
        } />
        <Route path="/mini-assessment" element={
          <PrivateRoute>
            <MiniAssessment />
          </PrivateRoute>
        } />
        <Route path="/study-plan" element={
          <PrivateRoute>
            <StudyPlan />
          </PrivateRoute>
        } />
        <Route path="/practice" element={
          <PrivateRoute>
            <PracticeQuestions />
          </PrivateRoute>
        } />
        <Route path="/practice-exams" element={
          <PrivateRoute>
            <PracticeExams />
          </PrivateRoute>
        } />
        <Route path="/exam/:examId" element={
          <PrivateRoute>
            <ExamPage />
          </PrivateRoute>
        } />
        <Route path="/performance" element={
          <PrivateRoute>
            <Performance />
          </PrivateRoute>
        } />
        <Route path="/leaderboard" element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        } />
        <Route path="/challenges" element={
          <PrivateRoute>
            <Challenges />
          </PrivateRoute>
        } />
        <Route path="/stress-management" element={
          <PrivateRoute>
            <StressManagement />
          </PrivateRoute>
        } />
        <Route path="/stress-management/:contentId" element={
          <PrivateRoute>
            <StressManagementDetail />
          </PrivateRoute>
        } />
        
        {/* New Social Features Routes */}
        <Route path="/study-groups" element={
          <PrivateRoute>
            <StudyGroups />
          </PrivateRoute>
        } />
        <Route path="/study-groups/create" element={
          <PrivateRoute>
            <CreateStudyGroupPage />
          </PrivateRoute>
        } />
        <Route path="/study-groups/:groupId" element={
          <PrivateRoute>
            <StudyGroupDetailPage />
          </PrivateRoute>
        } />
        <Route path="/shared-notes" element={
          <PrivateRoute>
            <SharedNotes />
          </PrivateRoute>
        } />
        
        {/* Feedback System Route */}
        <Route path="/feedback" element={
          <PrivateRoute>
            <FeedbackPage />
          </PrivateRoute>
        } />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App; 