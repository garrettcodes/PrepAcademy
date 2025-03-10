import React, { useState } from 'react';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useAuth } from '../context/AuthContext';

const Leaderboard: React.FC = () => {
  const { leaderboardData, loading, error, fetchLeaderboard, currentCategory, setCurrentCategory } = useLeaderboard();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = [
    { id: 'points', label: 'Total Points' },
    { id: 'questions', label: 'Questions Answered' },
    { id: 'exams', label: 'Exam Performance' },
    { id: 'weekly', label: 'Weekly Progress' },
    { id: 'monthly', label: 'Monthly Progress' },
  ];

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLeaderboard(currentCategory, 10, page);
  };

  return (
    <div className="flex flex-col space-y-8 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-gray-600">
          Compete with other students and see how you rank!
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              currentCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Current user rank */}
      {leaderboardData?.userRank && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h2 className="font-semibold text-lg mb-2">Your Ranking</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white font-bold h-12 w-12 rounded-full flex items-center justify-center">
              #{leaderboardData.userRank.rank}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-600">{leaderboardData.userRank.score} points</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600 border border-red-200">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData?.entries.map((entry) => (
                <tr key={entry._id} className={entry.user._id === user?._id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {entry.rank === 1 ? (
                        <span className="text-yellow-500 text-2xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-gray-400 text-2xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-700 text-2xl">🥉</span>
                      ) : (
                        <span className="text-gray-500 font-semibold">#{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.score} points
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {leaderboardData && leaderboardData.pagination.pages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: leaderboardData.pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === leaderboardData.pagination.pages}
              className={`px-3 py-1 rounded-md ${
                currentPage === leaderboardData.pagination.pages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 