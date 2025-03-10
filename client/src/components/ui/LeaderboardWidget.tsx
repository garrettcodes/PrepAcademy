import React from 'react';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { useAuth } from '../../context/AuthContext';

const LeaderboardWidget: React.FC = () => {
  const { leaderboardData, loading, error } = useLeaderboard();
  const { user } = useAuth();
  
  // Show only top 5 users
  const topUsers = leaderboardData?.entries.slice(0, 5) || [];

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <Link 
          to="/leaderboard" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 py-2">
          {error}
        </div>
      ) : topUsers.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">
          No leaderboard data available
        </div>
      ) : (
        <div className="space-y-2">
          {topUsers.map((entry, index) => (
            <div 
              key={entry._id} 
              className={`flex items-center justify-between p-2 rounded-md ${
                entry.user._id === user?._id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 text-center">
                  {entry.rank === 1 ? (
                    <span className="text-yellow-500 text-lg">🥇</span>
                  ) : entry.rank === 2 ? (
                    <span className="text-gray-400 text-lg">🥈</span>
                  ) : entry.rank === 3 ? (
                    <span className="text-amber-700 text-lg">🥉</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">#{entry.rank}</span>
                  )}
                </div>
                <div className="ml-2 text-sm font-medium truncate max-w-[150px]">
                  {entry.user.name}
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {entry.score} pts
              </div>
            </div>
          ))}
          
          {/* Show the current user's position if not in top 5 */}
          {leaderboardData?.userRank && 
           !topUsers.some(entry => entry.user._id === user?._id) && (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex items-center justify-between p-2 rounded-md bg-blue-50">
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <span className="text-sm font-medium text-gray-500">
                      #{leaderboardData.userRank.rank}
                    </span>
                  </div>
                  <div className="ml-2 text-sm font-medium truncate max-w-[150px]">
                    {user?.name} (You)
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {leaderboardData.userRank.score} pts
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget; 