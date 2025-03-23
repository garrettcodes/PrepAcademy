import React from 'react';

export interface PointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ points, size = 'md' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-0.5 px-2';
      case 'lg':
        return 'text-base py-1.5 px-3';
      case 'md':
      default:
        return 'text-sm py-1 px-2.5';
    }
  };

  return (
    <div className={`flex items-center bg-yellow-100 text-yellow-800 rounded-full font-medium ${getSizeClasses()}`}>
      <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
      </svg>
      {points} pts
    </div>
  );
};

export default PointsBadge; 