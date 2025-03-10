import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define task interface
interface Task {
  _id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
}

// Define notification interface
interface Notification {
  type: string;
  message: string;
  details: any;
}

const StudyPlan: React.FC = () => {
  const navigate = useNavigate();
  const { studyPlan, fetchStudyPlan, loading, error } = useStudy();
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly'>('daily');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch study plan on mount
  useEffect(() => {
    fetchStudyPlan();
  }, [fetchStudyPlan]);

  // Handle marking a task as complete
  const handleUpdateTaskStatus = async (taskId: string, taskType: 'daily' | 'weekly', newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      
      const response = await axios.patch(
        `${API_URL}/studyplan/task`,
        {
          taskId,
          taskType,
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.status === 200) {
        // Refresh study plan
        fetchStudyPlan();
        
        // Check for notifications
        if (response.data.notifications && response.data.notifications.length > 0) {
          setNotifications(response.data.notifications);
          setShowNotification(true);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise, format as Month Day
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      </div>
    );
  }

  // If no study plan
  if (!studyPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">No Study Plan Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have a study plan yet. Take the diagnostic test to create a personalized study plan.
          </p>
          <button
            onClick={() => navigate('/diagnostic')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Diagnostic Test
          </button>
        </div>
      </div>
    );
  }

  const tasks = selectedTab === 'daily' ? studyPlan.dailyGoals : studyPlan.weeklyGoals;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification Toast */}
      {showNotification && notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          {notifications.map((notification, index) => (
            <div 
              key={index}
              className={`mb-2 p-4 rounded-md shadow-lg text-white ${
                notification.type === 'milestone' ? 'bg-purple-600' : 'bg-green-600'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-2">
                  {notification.type === 'taskCompleted' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p>{notification.message}</p>
                </div>
                <button 
                  className="ml-auto text-white opacity-75 hover:opacity-100"
                  onClick={() => setShowNotification(false)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Study Plan</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Progress:</span>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${studyPlan.progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{studyPlan.progress}%</span>
          </div>
        </div>

        {/* Learning Style Section */}
        {studyPlan.learningStyleRecommendations && studyPlan.learningStyleRecommendations.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Your Learning Style Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {studyPlan.learningStyleRecommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Display struggling areas recommendations if available */}
        {studyPlan.recommendations && studyPlan.recommendations.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Additional Resources for Struggling Areas</h3>
            <div className="space-y-3">
              {studyPlan.recommendations.map((rec, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-800">{rec.subject}</h4>
                  {rec.resources && rec.resources.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {rec.resources.map((resource, resIndex) => (
                        <li key={resIndex} className="text-gray-700">{resource}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              selectedTab === 'daily'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('daily')}
          >
            Daily Goals
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              selectedTab === 'weekly'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('weekly')}
          >
            Weekly Goals
          </button>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No {selectedTab} goals available. Take the diagnostic test to generate a personalized study plan.
            </p>
          ) : (
            tasks.map((task: Task) => (
              <div 
                key={task._id} 
                className={`border rounded-lg p-4 transition-colors ${
                  task.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : task.status === 'in-progress'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleUpdateTaskStatus(
                        task._id, 
                        selectedTab, 
                        task.status === 'completed' ? 'pending' : 'completed'
                      )}
                      disabled={updatingTaskId === task._id}
                    >
                      {task.status === 'completed' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.task}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {formatDate(task.dueDate)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Change Dropdown */}
                  <div className="relative">
                    <select
                      className="text-sm border border-gray-300 rounded-md py-1 pl-3 pr-8 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task._id, selectedTab, e.target.value)}
                      disabled={updatingTaskId === task._id}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {updatingTaskId === task._id && (
                      <div className="absolute right-10 top-1">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlan; 