import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import PointsBadge from '../components/ui/PointsBadge';
import BadgeDisplay from '../components/ui/BadgeDisplay';
import { getUserBadges } from '../services/badgeService';
import Button from '../components/ui/Button';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const userBadges = await getUserBadges();
        setBadges(userBadges);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load your badges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500">Please log in to view your profile.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
              <span className="text-5xl text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6">{user.name}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Learning Style</span>
                <span className="font-medium capitalize">{user.learningStyle}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Target Score</span>
                <span className="font-medium">{user.targetScore}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Points</span>
                <PointsBadge points={user.points || 0} />
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Test Date</span>
                <span className="font-medium">
                  {new Date(user.testDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges card */}
        <div className="lg:col-span-2">
          <BadgeDisplay 
            badges={badges} 
            title="Your Achievements" 
            emptyMessage={
              loading 
                ? "Loading your badges..." 
                : error 
                  ? error 
                  : "No badges earned yet. Keep practicing to earn achievements!"
            }
          />
          
          {badges.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline">View All Badges</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 