import React, { useState } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { format, formatDistanceToNow } from 'date-fns';

const Challenges: React.FC = () => {
  const { activeChallenges, userChallenges, loading, error, joinChallenge } = useChallenge();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoinChallenge = async (challengeId: string) => {
    setJoiningId(challengeId);
    await joinChallenge(challengeId);
    setJoiningId(null);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getTimeRemaining = (endDate: string) => {
    return formatDistanceToNow(new Date(endDate), { addSuffix: true });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
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
    <div className="flex flex-col space-y-8 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <p className="text-gray-600">
          Complete time-limited challenges to earn bonus points and badges!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Challenges
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Challenge History
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600 border border-red-200">
          {error}
        </div>
      ) : activeTab === 'active' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeChallenges.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active challenges available right now.</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new challenges!</p>
            </div>
          ) : (
            activeChallenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2 text-xl">
                        {getChallengeTypeIcon(challenge.type)}
                      </span>
                      {challenge.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {challenge.type}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{challenge.description}</p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress: {challenge.userProgress} / {challenge.target}</span>
                        <span>{getProgressPercentage(challenge.userProgress, challenge.target)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${getProgressPercentage(challenge.userProgress, challenge.target)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ends: {formatDate(challenge.endDate)}</span>
                      <span className="text-orange-600 font-medium">
                        {getTimeRemaining(challenge.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-700 mr-1">Reward:</span>
                      <span>{challenge.reward.points} points</span>
                      {challenge.reward.badgeId && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          + Badge
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-5">
                    {challenge.participationId ? (
                      <button
                        className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md font-medium"
                        disabled
                      >
                        {challenge.isCompleted ? 'Completed!' : 'Already Joined'}
                      </button>
                    ) : (
                      <button
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={joiningId === challenge._id}
                      >
                        {joiningId === challenge._id ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                            Joining...
                          </span>
                        ) : (
                          'Join Challenge'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {userChallenges.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't participated in any challenges yet.</p>
              <p className="text-gray-400 text-sm mt-2">Join a challenge to see your history here!</p>
            </div>
          ) : (
            userChallenges.map((participation) => (
              <div
                key={participation._id}
                className="bg-white rounded-lg shadow-sm p-5 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getChallengeTypeIcon(participation.challenge.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {participation.challenge.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(participation.createdAt)} - {formatDate(participation.challenge.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {participation.isCompleted ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    ) : new Date(participation.challenge.endDate) < new Date() ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Expired
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress: {participation.progress} / {participation.challenge.target}</span>
                    <span>
                      {getProgressPercentage(participation.progress, participation.challenge.target)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        participation.isCompleted ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${getProgressPercentage(
                          participation.progress,
                          participation.challenge.target
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>{participation.challenge.description}</p>
                </div>
                
                {participation.isCompleted && (
                  <div className="mt-4 bg-green-50 p-3 rounded-md">
                    <div className="flex items-center text-green-800">
                      <span className="font-medium mr-2">Rewards earned:</span>
                      <span>{participation.challenge.reward.points} points</span>
                      {participation.challenge.reward.badgeId && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          + Badge
                        </span>
                      )}
                    </div>
                    {participation.completedDate && (
                      <div className="text-xs text-green-600 mt-1">
                        Completed on {formatDate(participation.completedDate)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Challenges; 