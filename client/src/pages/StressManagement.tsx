import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStressManagement } from '../context/StressManagementContext';
import DownloadForOfflineButton from '../components/ui/DownloadForOfflineButton';

const StressManagement: React.FC = () => {
  const { content, loading, error, filterByCategory } = useStressManagement();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const categories = [
    { id: 'anxiety', label: 'Anxiety Reduction', icon: '😌' },
    { id: 'timeManagement', label: 'Time Management', icon: '⏰' },
    { id: 'testStrategies', label: 'Test Strategies', icon: '📝' },
    { id: 'relaxation', label: 'Relaxation Techniques', icon: '🧘' },
    { id: 'focus', label: 'Focus & Concentration', icon: '🎯' },
  ];
  
  const filteredContent = filterByCategory(selectedCategory);
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'exercise':
        return '🏋️';
      case 'audio':
        return '🎧';
      case 'video':
        return '🎬';
      case 'interactive':
        return '🎮';
      default:
        return '📋';
    }
  };

  return (
    <div className="flex flex-col space-y-8 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Stress Management</h1>
        <p className="text-gray-600">
          Techniques and resources to help you manage stress, anxiety, and improve focus during test preparation.
        </p>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedCategory(undefined)}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Content grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600 border border-red-200">
          {error}
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No stress management resources found.</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting a different category or check back later.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2 text-xl">
                      {getContentTypeIcon(item.type)}
                    </span>
                    {item.title}
                  </h3>
                  
                  {item.userProgress?.completed && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </div>
                
                <p className="mt-2 text-gray-600 line-clamp-2">{item.description}</p>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {item.duration || 5} min
                  </span>
                  
                  <span className="mx-2">•</span>
                  
                  <span className="capitalize">
                    {categories.find(c => c.id === item.category)?.label || item.category}
                  </span>
                </div>
                
                {item.userProgress && item.userProgress.progress > 0 && item.userProgress.progress < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${item.userProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-5 flex justify-between items-center">
                  <Link
                    to={`/stress-management/${item._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    {item.userProgress?.progress ? 'Continue' : 'Start'}
                  </Link>
                  
                  <DownloadForOfflineButton
                    contentType="stressManagement"
                    contentId={item._id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StressManagement; 