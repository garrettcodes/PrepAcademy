import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useParentAuth } from '../../context/ParentAuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface StudentDetailData {
  _id: string;
  name: string;
  email: string;
  learningStyle: string;
  targetScore: number;
  testDate: string;
  points: number;
  badges: Array<{
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>;
  performanceData: Array<any>;
  studyPlan: any;
}

const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { parent, isAuthenticated, loading } = useParentAuth();
  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Protect this route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetail = async () => {
      if (!parent || !studentId) return;

      try {
        setLoadingStudent(true);
        setError(null);

        const response = await axios.get(`${API_URL}/parents/student/${studentId}`, {
          headers: { Authorization: `Bearer ${parent.token}` }
        });

        setStudent(response.data);
      } catch (err: any) {
        console.error('Error fetching student details:', err);
        setError(err.response?.data?.message || 'Failed to load student data');
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentDetail();
  }, [parent, studentId]);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading || loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="mt-2">
                <Link to="/parent/dashboard" className="text-red-700 font-medium underline">
                  Return to dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Student Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The student you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6">
            <Link to="/parent/dashboard" className="text-indigo-600 hover:text-indigo-500">
              Return to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
          <Link
            to="/parent/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Student Profile Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Student Profile
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and academic progress
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Learning style</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                    {student.learningStyle}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Target score</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student.targetScore}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Test date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(student.testDate)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Points earned</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student.points}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Achievements & Badges
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Badges and awards earned through academic achievements
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {student.badges && student.badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {student.badges.map((badge) => (
                    <div key={badge._id} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-2">
                        <span className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                          {badge.icon || '🏆'}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No badges earned yet.</p>
              )}
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Generate Reports
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Create custom reports to track progress
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <div className="flex-shrink-0">
                    <span className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                      📊
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/parent/reports/${student._id}?type=progress`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true"></span>
                      <p className="text-sm font-medium text-gray-900">
                        Progress Report
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Overall academic performance
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <div className="flex-shrink-0">
                    <span className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                      ⏱️
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/parent/reports/${student._id}?type=study-time`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true"></span>
                      <p className="text-sm font-medium text-gray-900">
                        Study Time Report
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Time spent studying
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <div className="flex-shrink-0">
                    <span className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                      ✅
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/parent/reports/${student._id}?type=task-completion`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true"></span>
                      <p className="text-sm font-medium text-gray-900">
                        Task Completion Report
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Assignments and tasks completed
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDetail; 