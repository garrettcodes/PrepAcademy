import React from 'react';
import Badge from './Badge';

// Badge interface
interface BadgeType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface BadgeDisplayProps {
  badges: BadgeType[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  title = 'Your Badges',
  emptyMessage = 'No badges earned yet. Keep learning to earn badges!',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {badges.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <Badge
              key={badge._id}
              name={badge.name}
              description={badge.description}
              icon={badge.icon}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay; 