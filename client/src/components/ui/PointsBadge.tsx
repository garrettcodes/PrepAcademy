import React from 'react';

interface PointsBadgeProps {
  points: number;
  className?: string;
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ points, className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="inline-flex items-center justify-center p-2 bg-yellow-100 text-yellow-800 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </span>
      <span className="font-medium text-yellow-800">{points} Points</span>
    </div>
  );
};

export default PointsBadge; 