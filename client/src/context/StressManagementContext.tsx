import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';

interface UserProgress {
  completed: boolean;
  progress: number;
  rating?: number;
  favorite: boolean;
  notes?: string;
}

interface StressManagementContent {
  _id: string;
  title: string;
  description: string;
  type: 'article' | 'exercise' | 'audio' | 'video' | 'interactive';
  content: string;
  duration?: number;
  category: 'anxiety' | 'timeManagement' | 'testStrategies' | 'relaxation' | 'focus';
  tags: string[];
  mediaUrl?: string;
  order: number;
  userProgress?: UserProgress;
}

interface StressManagementContextType {
  content: StressManagementContent[];
  favoriteContent: StressManagementContent[];
  currentContent: StressManagementContent | null;
  loading: boolean;
  error: string | null;
  fetchAllContent: () => Promise<void>;
  fetchContentById: (contentId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  updateProgress: (
    contentId: string,
    progressData: Partial<UserProgress>
  ) => Promise<boolean>;
  filterByCategory: (category?: string) => StressManagementContent[];
}

const StressManagementContext = createContext<StressManagementContextType | null>(null);

export const useStressManagement = () => {
  const context = useContext(StressManagementContext);
  if (!context) {
    throw new Error('useStressManagement must be used within a StressManagementProvider');
  }
  return context;
};

export const StressManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<StressManagementContent[]>([]);
  const [favoriteContent, setFavoriteContent] = useState<StressManagementContent[]>([]);
  const [currentContent, setCurrentContent] = useState<StressManagementContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuth();
  const { isOnline, addPendingAction } = useOffline();
  
  const fetchAllContent = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stress-management/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setContent(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch stress management content. Please try again later.'
      );
      console.error('Error fetching stress management content:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchContentById = async (contentId: string) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if the content is already in the state
      const existingContent = content.find(item => item._id === contentId);
      
      if (existingContent) {
        setCurrentContent(existingContent);
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stress-management/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCurrentContent(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch content. Please try again later.'
      );
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFavorites = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stress-management/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setFavoriteContent(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to fetch favorites. Please try again later.'
      );
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProgress = async (
    contentId: string,
    progressData: Partial<UserProgress>
  ) => {
    if (!token) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // If offline, store the action for later sync
      if (!isOnline) {
        addPendingAction({
          type: 'UPDATE_STRESS_MANAGEMENT_PROGRESS',
          data: {
            contentId,
            ...progressData,
          },
        });
        
        // Update local state optimistically
        setContent(prevContent => 
          prevContent.map(item => 
            item._id === contentId
              ? {
                  ...item,
                  userProgress: {
                    ...(item.userProgress || { completed: false, progress: 0, favorite: false }),
                    ...progressData,
                  },
                }
              : item
          )
        );
        
        if (currentContent && currentContent._id === contentId) {
          setCurrentContent({
            ...currentContent,
            userProgress: {
              ...(currentContent.userProgress || { completed: false, progress: 0, favorite: false }),
              ...progressData,
            },
          });
        }
        
        setLoading(false);
        return true;
      }
      
      // If online, send to server
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/stress-management/${contentId}/progress`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setContent(prevContent => 
        prevContent.map(item => 
          item._id === contentId
            ? {
                ...item,
                userProgress: {
                  ...(item.userProgress || { completed: false, progress: 0, favorite: false }),
                  ...progressData,
                },
              }
            : item
        )
      );
      
      if (currentContent && currentContent._id === contentId) {
        setCurrentContent({
          ...currentContent,
          userProgress: {
            ...(currentContent.userProgress || { completed: false, progress: 0, favorite: false }),
            ...progressData,
          },
        });
      }
      
      // If favorite status was updated, refresh favorites
      if (progressData.favorite !== undefined) {
        fetchFavorites();
      }
      
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to update progress. Please try again later.'
      );
      console.error('Error updating progress:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const filterByCategory = (category?: string) => {
    if (!category) return content;
    
    return content.filter(item => item.category === category);
  };
  
  useEffect(() => {
    if (token) {
      fetchAllContent();
      fetchFavorites();
    }
  }, [token]);
  
  return (
    <StressManagementContext.Provider
      value={{
        content,
        favoriteContent,
        currentContent,
        loading,
        error,
        fetchAllContent,
        fetchContentById,
        fetchFavorites,
        updateProgress,
        filterByCategory,
      }}
    >
      {children}
    </StressManagementContext.Provider>
  );
};

export default StressManagementContext; 