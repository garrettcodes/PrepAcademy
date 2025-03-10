import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface AssessmentNotificationProps {
  onClose: () => void;
}

const AssessmentNotification: React.FC<AssessmentNotificationProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Auto hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Add a small delay for animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleTakeMiniAssessment = () => {
    navigate('/mini-assessment');
    handleClose();
  };

  // If notification is not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 m-4 z-50 transition-all duration-300 ease-in-out transform">
      <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500 flex max-w-md">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Mini-Assessment Due</h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Your bi-weekly learning style assessment is now due. This short assessment helps us fine-tune your learning experience.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleTakeMiniAssessment}
              className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Take Assessment
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentNotification; 