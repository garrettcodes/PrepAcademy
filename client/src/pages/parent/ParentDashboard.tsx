import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParentAuth } from '../../context/ParentAuthContext';
import axios from 'axios';

interface StudentBasicInfo {
  _id: string;
  name: string;
  email: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ParentDashboard = () => {
  const { parent, isAuthenticated, loading, logout, linkStudent, error, clearError } = useParentAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [students, setStudents] = useState<StudentBasicInfo[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const navigate = useNavigate();

  // Protect this route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Load student details when parent data is available
  useEffect(() => {
    const fetchStudents = async () => {
      if (parent && parent.students && parent.students.length > 0) {
        setLoadingStudents(true);
        try {
          const studentData: StudentBasicInfo[] = [];
          
          for (const studentId of parent.students) {
            try {
              const response = await axios.get(`${API_URL}/parents/student/${studentId}`, {
                headers: { Authorization: `Bearer ${parent.token}` }
              });
              
              studentData.push({
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email
              });
            } catch (err) {
              console.error(`Failed to fetch student ${studentId}:`, err);
            }
          }
          
          setStudents(studentData);
        } catch (err) {
          console.error('Error fetching students:', err);
        } finally {
          setLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [parent]);

  // Handle linking a student
  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!studentEmail) {
      setLinkError('Please enter a student email');
      return;
    }

    try {
      await linkStudent(studentEmail);
      setLinkSuccess(`Student with email ${studentEmail} linked successfully`);
      setStudentEmail('');
    } catch (err: any) {
      setLinkError(err.response?.data?.message || 'Error linking student');
    }
  };

  if (loading || !parent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4 bg-white">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome, {parent.name}</h2>
              <p className="text-gray-600">
                This is your parent portal dashboard where you can monitor your child's educational progress.
              </p>
            </div>

            {/* Link Student Form */}
            <div className="bg-gray-50 p-4 rounded-md mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Link Your Child's Account</h3>
              <form onSubmit={handleLinkStudent} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your child's email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Link Account
                </button>
              </form>
              {linkError && <p className="mt-2 text-sm text-red-600">{linkError}</p>}
              {linkSuccess && <p className="mt-2 text-sm text-green-600">{linkSuccess}</p>}
            </div>

            {/* Students List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Linked Students</h3>
              
              {loadingStudents ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <li key={student._id}>
                        <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-md font-medium text-indigo-600 truncate">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-3">
                            <Link
                              to={`/parent/student/${student._id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              View Progress
                            </Link>
                            <Link
                              to={`/parent/reports/${student._id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Generate Reports
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No students linked to your account. Use the form above to link your child's account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard; 