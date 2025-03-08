import React, { useState, useEffect } from 'react';
import Badge from './Badge';

interface BadgeType {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

interface BadgeNotificationProps {
  badges: BadgeType[];
  onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badges, onClose }) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Auto hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Add a small delay for animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Only show if there are badges and the notification is visible
  if (badges.length === 0 || !visible) {
    return null;
  }

  const currentBadge = badges[currentBadgeIndex];

  return (
    <div className="fixed top-0 right-0 m-4 z-50 transition-all duration-300 ease-in-out transform">
      <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-indigo-500 flex">
        <div className="flex flex-col items-center mr-4">
          <Badge 
            name={currentBadge.name}
            description={currentBadge.description}
            icon={currentBadge.icon}
            size="lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Badge Earned!</h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {currentBadge.description}
          </p>
          {badges.length > 1 && (
            <div className="mt-3 flex justify-between">
              <span className="text-xs text-gray-500">{currentBadgeIndex + 1} of {badges.length}</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentBadgeIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentBadgeIndex === 0}
                  className={`text-indigo-600 ${currentBadgeIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-800'}`}
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentBadgeIndex(prev => Math.min(badges.length - 1, prev + 1))}
                  disabled={currentBadgeIndex === badges.length - 1}
                  className={`text-indigo-600 ${currentBadgeIndex === badges.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-800'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification; 