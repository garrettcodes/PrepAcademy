import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StudyGroupList from '../../components/social/StudyGroupList';

const StudyGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('my');
  const [topicFilter, setTopicFilter] = useState<string>('');

  const topics = [
    'Math', 'Reading', 'Writing', 'English', 'Science', 'SAT', 'ACT', 'General'
  ];

  return (
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

      {activeTab === 'public' && (
        <div className="mb-6">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Topic
          </label>
          <div className="flex">
            <select
              id="topic"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <StudyGroupList type={activeTab} topicFilter={topicFilter || undefined} />
    </div>
  );
};

export default StudyGroups; 