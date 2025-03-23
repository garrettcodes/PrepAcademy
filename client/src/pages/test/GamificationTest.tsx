import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Badge from '../../components/ui/Badge';
import PointsBadge from '../../components/ui/PointsBadge';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface BadgeType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: {
    type: string;
    subject?: string;
    score?: number;
    questionCount?: number;
  };
}

const GamificationTest: React.FC = () => {
  const { user, getUser } = useAuth();
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testQuestionId, setTestQuestionId] = useState<string>('');
  const [testSubject, setTestSubject] = useState<string>('Math');
  const [testPoints, setTestPoints] = useState<number>(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all available badges
        const badgesResponse = await axios.get<BadgeType[]>(`${API_URL}/badges`);
        setAllBadges(badgesResponse.data);
        
        // Fetch user's badges
        const userBadgesResponse = await axios.get<BadgeType[]>(`${API_URL}/badges/user`);
        setUserBadges(userBadgesResponse.data);
        
        // Try to find a valid question ID for testing
        try {
          const questionsResponse = await axios.get(`${API_URL}/questions`);
          if (questionsResponse.data && questionsResponse.data.length > 0) {
            setTestQuestionId(questionsResponse.data[0]._id);
          }
        } catch (err) {
          console.error('Error fetching questions:', err);
        }
        
        addToLog('Data loaded successfully');
      } catch (err) {
        console.error('Error fetching data:', err);
        addToLog('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const addToLog = (message: string) => {
    setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const refreshUserData = async () => {
    try {
      addToLog('Refreshing user data...');
      
      // Only call getUser if it exists
      if (getUser) {
        await getUser();
      } else {
        addToLog('getUser function not available');
      }
      
      // Refresh user badges
      const userBadgesResponse = await axios.get<BadgeType[]>(`${API_URL}/badges/user`);
      setUserBadges(userBadgesResponse.data);
      
      addToLog('User data refreshed');
    } catch (err) {
      console.error('Error refreshing user data:', err);
      addToLog('Error refreshing user data');
    }
  };
  
  const simulateCorrectAnswer = async () => {
    try {
      if (!testQuestionId) {
        addToLog('No test question ID available');
        return;
      }
      
      addToLog(`Simulating correct answer for subject: ${testSubject}`);
      
      // Make API call to submit a correct answer
      const token = localStorage.getItem('token');
      if (!token) {
        addToLog('Not authenticated');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/questions/${testQuestionId}/answer`,
        {
          selectedAnswer: "correct", // The backend will treat this as correct in test mode
          subject: testSubject,
          timeSpent: 60, // 1 minute
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      addToLog(`Answer submitted successfully. Response: ${JSON.stringify(response.data)}`);
      
      // Refresh user data to see updated points and badges
      await refreshUserData();
    } catch (err) {
      console.error('Error simulating answer:', err);
      addToLog('Error simulating answer');
    }
  };
  
  const simulatePointsUpdate = async () => {
    try {
      addToLog(`Simulating points update: +${testPoints} points`);
      
      // Make API call to update points
      const token = localStorage.getItem('token');
      if (!token) {
        addToLog('Not authenticated');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/users/points`,
        {
          points: testPoints,
          reason: 'Test points award',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      addToLog(`Points updated successfully. Response: ${JSON.stringify(response.data)}`);
      
      // Refresh user data to see updated points and badges
      await refreshUserData();
    } catch (err) {
      console.error('Error updating points:', err);
      addToLog('Error updating points. This endpoint may not exist yet.');
    }
  };
  
  const clearLog = () => {
    setEventLog([]);
  };
  
  const formatCriteria = (badge: BadgeType) => {
    const { criteria } = badge;
    
    switch (criteria.type) {
      case 'subject-mastery':
        return `Achieve 100% in ${criteria.subject}`;
      case 'question-count':
        return `Answer ${criteria.questionCount} questions`;
      case 'perfect-score':
        return `Get ${criteria.questionCount} perfect scores`;
      case 'point-milestone':
        return `Earn ${criteria.score} points`;
      default:
        return criteria.type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gamification Test</h1>
      
      {/* User Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User Stats</h2>
        {user ? (
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p className="flex items-center gap-2 mt-2">
                <span className="font-medium">Points:</span> 
                <PointsBadge points={user.points || 0} />
              </p>
            </div>
            <div className="flex-1">
              <p className="font-medium mb-2">Badges Earned ({userBadges.length}):</p>
              {userBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userBadges.map(badge => (
                    <Badge
                      key={badge._id}
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No badges earned yet</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Not logged in</p>
        )}
      </div>
      
      {/* Test Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correct Answer Simulation */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium text-lg mb-3">Simulate Correct Answer</h3>
            <p className="text-sm text-gray-600 mb-3">
              This will simulate answering a question correctly, which awards points and may trigger badges.
            </p>
            
            <div className="mb-3">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="Math">Math</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
              </select>
            </div>
            
            <button
              onClick={simulateCorrectAnswer}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
              disabled={loading || !testQuestionId}
            >
              Simulate Correct Answer
            </button>
          </div>
          
          {/* Points Update Simulation */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium text-lg mb-3">Simulate Points Update</h3>
            <p className="text-sm text-gray-600 mb-3">
              This will simulate receiving points, which may trigger point-milestone badges.
            </p>
            
            <div className="mb-3">
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Points to Add
              </label>
              <input
                type="number"
                id="points"
                value={testPoints}
                onChange={(e) => setTestPoints(parseInt(e.target.value) || 0)}
                min="1"
                step="5"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            
            <button
              onClick={simulatePointsUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
              disabled={loading}
            >
              Simulate Points Update
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={refreshUserData}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Refresh User Data
          </button>
        </div>
      </div>
      
      {/* Available Badges */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Badges</h2>
          <span className="text-sm text-gray-500">{allBadges.length} total badges</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : allBadges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allBadges.map(badge => {
                  const isEarned = userBadges.some(userBadge => userBadge._id === badge._id);
                  
                  return (
                    <tr key={badge._id} className={isEarned ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge name={badge.name} description={badge.description} icon={badge.icon} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{badge.name}</td>
                      <td className="px-6 py-4">{badge.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCriteria(badge)}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{badge.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEarned ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Earned
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not Earned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No badges available</p>
        )}
      </div>
      
      {/* Event Log */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Event Log</h2>
          <button
            onClick={clearLog}
            className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Clear Log
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {eventLog.length > 0 ? (
            <ul className="space-y-1">
              {eventLog.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No events logged yet</p>
          )}
        </div>
      </div>
      
      {/* Testing Badge Notifications */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <h3 className="font-medium text-yellow-800 mb-2">Testing Badge Notifications</h3>
        <p className="text-sm text-yellow-700">
          When you use the "Simulate Correct Answer" button, you may earn badges that will be displayed as a notification.
          These notifications also appear automatically during regular practice and exams.
        </p>
      </div>
    </div>
  );
};

export default GamificationTest; 