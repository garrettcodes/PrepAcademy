import React, { useState } from 'react';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import FeedbackHistory from '../../components/feedback/FeedbackHistory';

const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Feedback Center</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Feedback History
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'submit' ? (
        <FeedbackForm onSuccess={() => setActiveTab('history')} />
      ) : (
        <FeedbackHistory />
      )}
    </div>
  );
};

export default FeedbackPage; 