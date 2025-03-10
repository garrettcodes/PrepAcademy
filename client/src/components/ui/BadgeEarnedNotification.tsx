import React, { useState, useEffect } from 'react';
import Badge from './Badge';

interface BadgeType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface BadgeEarnedNotificationProps {
  badge: BadgeType;
  onClose: () => void;
}

const BadgeEarnedNotification: React.FC<BadgeEarnedNotificationProps> = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Play animation for 3 seconds, then stay visible for 4 more seconds
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
    
    // Auto-close after 7 seconds
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow exit animation to play
    }, 7000);
    
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 transform ${isAnimating ? 'animate-bounce' : ''} transition-all duration-300`}>
      <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-indigo-500 flex max-w-md">
        <div className="flex flex-col items-center mr-4">
          <Badge 
            name={badge.name}
            description={badge.description}
            icon={badge.icon}
            size="lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Badge Earned!</h3>
            <button 
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Allow exit animation to play
              }}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {badge.description}
          </p>
          <div className="mt-2 text-xs font-medium text-indigo-600">
            {badge.category === 'achievement' ? 'Achievement' : 
              badge.category === 'subject' ? 'Subject Mastery' : 
              badge.category === 'streak' ? 'Streak' : 'Special'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ 
                width: isAnimating ? '100%' : '0%',
                transition: 'width 7s linear'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeEarnedNotification; 