import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStressManagement } from '../../context/StressManagementContext';

const StressManagementWidget: React.FC = () => {
  const { content, loading, error } = useStressManagement();
  const [quickTip, setQuickTip] = useState<string>('');
  
  const quickTips = [
    "Take a 5-minute break every hour during intense study sessions.",
    "Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.",
    "Visualize success before starting a practice test.",
    "Stay hydrated - even mild dehydration can affect cognitive performance.",
    "Write down anxious thoughts to get them out of your head.",
    "Try a 10-minute walk to clear your mind when feeling overwhelmed.",
    "Create a consistent pre-study ritual to get your brain in the right mode.",
    "Break large study goals into smaller, manageable chunks.",
    "Use positive affirmations to combat negative self-talk.",
    "Try the Pomodoro Technique: 25 minutes of focus, then a 5-minute break.",
  ];
  
  useEffect(() => {
    // Select a random tip
    const randomIndex = Math.floor(Math.random() * quickTips.length);
    setQuickTip(quickTips[randomIndex]);
  }, []);
  
  // Get the recommended content (not completed, most relevant)
  const getRecommendedContent = () => {
    if (!content || content.length === 0) return [];
    
    // First, any in-progress items
    const inProgress = content.filter(item => 
      item.userProgress && 
      item.userProgress.progress > 0 && 
      !item.userProgress.completed
    );
    
    if (inProgress.length > 0) {
      return inProgress.slice(0, 2);
    }
    
    // Otherwise, recommend items that aren't completed
    const notCompleted = content.filter(item => 
      !item.userProgress || 
      !item.userProgress.completed
    );
    
    // Prioritize anxiety and relaxation content first
    return notCompleted
      .sort((a, b) => {
        if (a.category === 'anxiety' && b.category !== 'anxiety') return -1;
        if (a.category !== 'anxiety' && b.category === 'anxiety') return 1;
        if (a.category === 'relaxation' && b.category !== 'relaxation') return -1;
        if (a.category !== 'relaxation' && b.category === 'relaxation') return 1;
        return 0;
      })
      .slice(0, 2);
  };
  
  const recommendedContent = getRecommendedContent();

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stress Management</h2>
        <Link 
          to="/stress-management" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>
      
      {/* Quick tip section */}
      <div className="bg-blue-50 p-3 rounded-md mb-4">
        <div className="flex items-start">
          <span className="text-blue-500 mr-2 text-xl">💡</span>
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Quick Tip</h3>
            <p className="text-sm text-blue-700">{quickTip}</p>
          </div>
        </div>
      </div>
      
      {/* Content recommendations */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 py-2">
          {error}
        </div>
      ) : recommendedContent.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">
          No stress management resources available
        </div>
      ) : (
        <div className="space-y-3">
          {recommendedContent.map((item) => (
            <Link
              key={item._id}
              to={`/stress-management/${item._id}`}
              className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start">
                <span className="mr-2 text-lg">
                  {item.type === 'article' ? '📄' : 
                   item.type === 'exercise' ? '🏋️' : 
                   item.type === 'audio' ? '🎧' : 
                   item.type === 'video' ? '🎬' : '📋'}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                  {item.userProgress && item.userProgress.progress > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${item.userProgress.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          
          <Link
            to="/stress-management"
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
          >
            Explore stress management tools
          </Link>
        </div>
      )}
    </div>
  );
};

export default StressManagementWidget; 