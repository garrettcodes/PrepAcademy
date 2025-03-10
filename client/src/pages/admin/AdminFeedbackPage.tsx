import React from 'react';
import { Link } from 'react-router-dom';
import AdminFeedbackList from '../../components/feedback/AdminFeedbackList';

const AdminFeedbackPage: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feedback Management</h1>
        <Link
          to="/admin/dashboard"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-purple-700">
              This page allows you to manage user feedback. You can update the status, set priority, add admin notes, and respond to users.
            </p>
          </div>
        </div>
      </div>
      
      <AdminFeedbackList />
    </div>
  );
};

export default AdminFeedbackPage; 