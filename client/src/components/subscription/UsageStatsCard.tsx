import React from 'react';
import { UserUsageStats } from '../../services/userStatsService';

interface UsageStatsCardProps {
  stats: UserUsageStats | null;
  loading: boolean;
  error: string | null;
}

const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Your Usage Statistics</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Loading your subscription usage data...</p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Your Usage Statistics</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Subscription usage data</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Your Usage Statistics</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Subscription usage data</p>
      </div>
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="px-4 py-5 bg-gray-50 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Practice Questions Completed
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.completedPracticeQuestions}
              </dd>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Full-Length Exams Completed
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.completedExams}
              </dd>
            </div>
          </div>
          <div className="px-4 py-5 bg-gray-50 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Study Hours
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.studyHours}
              </dd>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Notes Created
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.createdNotes}
              </dd>
            </div>
          </div>
          <div className="px-4 py-5 bg-gray-50 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Study Groups Joined
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.joinedStudyGroups}
              </dd>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Notes Shared
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {stats.sharedNotes}
              </dd>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Subscription Information</h4>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500">Started:</span>
                <span className="text-sm text-gray-900">
                  {new Date(stats.subscriptionStartDate).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-sm text-gray-500">Renews:</span>
                <span className="text-sm text-gray-900">
                  {new Date(stats.subscriptionRenewalDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Account Activity</h4>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-500">Last login:</span>
                <span className="text-sm text-gray-900">
                  {new Date(stats.lastLoginDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStatsCard; 