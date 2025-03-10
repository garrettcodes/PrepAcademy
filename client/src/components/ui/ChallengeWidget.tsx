import React from 'react';
import { Link } from 'react-router-dom';
import { useChallenge } from '../../context/ChallengeContext';
import { formatDistanceToNow } from 'date-fns';

const ChallengeWidget: React.FC = () => {
  const { activeChallenges, loading, error } = useChallenge();
  
  // Show only top 3 challenges
  const topChallenges = activeChallenges.slice(0, 3);
  
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const getTimeRemaining = (endDate: string) => {
    return formatDistanceToNow(new Date(endDate), { addSuffix: true });
  };
  
  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'questions':
        return '❓';
      case 'exams':
        return '📝';
      case 'studyTime':
        return '⏱️';
      case 'performance':
        return '📈';
      default:
        return '🏆';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Challenges</h2>
        <Link 
          to="/challenges" 
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
      ) : topChallenges.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">
          No active challenges available
        </div>
      ) : (
        <div className="space-y-4">
          {topChallenges.map((challenge) => (
            <div 
              key={challenge._id} 
              className="border border-gray-200 rounded-md p-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <span className="mr-1.5 text-base">
                    {getChallengeTypeIcon(challenge.type)}
                  </span>
                  {challenge.title}
                </h3>
                <span className="text-xs text-orange-600">
                  {getTimeRemaining(challenge.endDate)}
                </span>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{challenge.userProgress} / {challenge.target}</span>
                  <span>{getProgressPercentage(challenge.userProgress, challenge.target)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${getProgressPercentage(challenge.userProgress, challenge.target)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Reward:</span> {challenge.reward.points} pts
                </div>
                
                {!challenge.participationId && (
                  <Link
                    to="/challenges"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Join
                  </Link>
                )}
              </div>
            </div>
          ))}
          
          <Link
            to="/challenges"
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
          >
            See all challenges
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChallengeWidget; 