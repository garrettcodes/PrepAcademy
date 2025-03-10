import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuestionProvider, useQuestion, QuestionContext } from './context/QuestionContext';
import { StudyProvider } from './context/StudyContext';
import { PracticeProvider } from './context/PracticeContext';
import { AIProvider } from './context/AIContext';
import { PerformanceProvider } from './context/PerformanceContext';
import Dashboard from './pages/Dashboard';
import DiagnosticTest from './pages/diagnostic/DiagnosticTest';
import MiniAssessment from './pages/diagnostic/MiniAssessment';
import StudyPlan from './pages/study/StudyPlan';
import PracticeQuestions from './pages/practice/PracticeQuestions';
import PracticeExams from './pages/practice/PracticeExams';
import ExamPage from './pages/practice/ExamPage';
import Performance from './pages/performance/Performance';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import BadgeNotification from './components/ui/BadgeNotification';
import AssessmentNotification from './components/ui/AssessmentNotification';
import Profile from './pages/Profile';
import ExamResultPage from './pages/practice/ExamResultPage';
import StudyTimeTest from './pages/test/StudyTimeTest';
import AIAssistantTest from './pages/test/AIAssistantTest';
import GamificationTest from './pages/test/GamificationTest';

// Root component that sets up providers
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <StudyProvider>
          <PracticeProvider>
            <AIProvider>
              <PerformanceProvider>
                <QuestionProvider>
                  <AppContent />
                </QuestionProvider>
              </PerformanceProvider>
            </AIProvider>
          </PracticeProvider>
        </StudyProvider>
      </AuthProvider>
    </Router>
  );
};

// Main app content with access to context values
const AppContent: React.FC = () => {
  const { isAuthenticated, miniAssessmentDue } = useAuth();
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

        {/* Protected Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/diagnostic" element={
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
          
          <Route path="/exams" element={
            <PrivateRoute>
              <PracticeExams />
            </PrivateRoute>
          } />
          
          <Route path="/exams/:id" element={
            <PrivateRoute>
              <ExamPage />
            </PrivateRoute>
          } />
          
          <Route path="/exams/results" element={<PrivateRoute><ExamResultPage /></PrivateRoute>} />
          
          <Route path="/performance" element={
            <PrivateRoute>
              <Performance />
            </PrivateRoute>
          } />
          
          {/* Test Routes */}
          <Route path="/test/study-time" element={
            <PrivateRoute>
              <StudyTimeTest />
            </PrivateRoute>
          } />
          <Route path="/test/ai-assistant" element={<PrivateRoute><AIAssistantTest /></PrivateRoute>} />
          <Route path="/test/gamification" element={<PrivateRoute><GamificationTest /></PrivateRoute>} />
        </Route>

        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App; 