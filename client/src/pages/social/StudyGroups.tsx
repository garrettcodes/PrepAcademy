import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StudyGroupList from '../../components/social/StudyGroupList';
import PremiumFeatureGuard from '../../components/subscription/PremiumFeatureGuard';

const StudyGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('my');
  const [topicFilter, setTopicFilter] = useState<string>('');

  const topics = [
    'Math', 'Reading', 'Writing', 'English', 'Science', 'SAT', 'ACT', 'General'
  ];

  // Content to display when premium access is required
  const premiumFallback = (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Study Groups - Premium Feature</h2>
        <p className="text-gray-600 mb-6">
          Study Groups allow you to collaborate with peers, share notes, and prepare together for your exams.
          Subscribe to access this feature and boost your test preparation.
        </p>
        <Link
          to="/pricing"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
        >
          View Subscription Plans
        </Link>
      </div>
    </div>
  );

  // Main content wrapped with PremiumFeatureGuard
  return (
    <PremiumFeatureGuard fallback={premiumFallback}>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Study Groups</h1>
          <Link
            to="/study-groups/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create New Group
          </Link>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Groups
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'public'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Find Groups
              </button>
            </nav>
          </div>
        </div>

        {/* Topic Filter */}
        {activeTab === 'public' && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTopicFilter('')}
                className={`px-3 py-1 rounded-full text-sm ${
                  topicFilter === ''
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All Topics
              </button>
              
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setTopicFilter(topic)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    topicFilter === topic
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        <StudyGroupList type={activeTab} topicFilter={topicFilter} />
      </div>
    </PremiumFeatureGuard>
  );
};

export default StudyGroups; 