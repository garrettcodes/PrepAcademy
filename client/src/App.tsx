import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { PracticeProvider } from './context/PracticeContext';
import { AIProvider } from './context/AIContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DiagnosticTest from './pages/diagnostic/DiagnosticTest';
import StudyPlan from './pages/study/StudyPlan';
import PracticeQuestions from './pages/practice/PracticeQuestions';
import PracticeExams from './pages/practice/PracticeExams';
import ExamPage from './pages/practice/ExamPage';
import Performance from './pages/performance/Performance';
import NotFound from './pages/NotFound';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <StudyProvider>
          <PracticeProvider>
            <AIProvider>
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
                  
                  <Route path="/diagnostic" element={
                    <PrivateRoute>
                      <DiagnosticTest />
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
                  
                  <Route path="/performance" element={
                    <PrivateRoute>
                      <Performance />
                    </PrivateRoute>
                  } />
                </Route>

                {/* 404 Route */}
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </AIProvider>
          </PracticeProvider>
        </StudyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 