import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface OfflineContextType {
  isOnline: boolean;
  offlineContent: {
    questions: any[];
    studyMaterials: any[];
  };
  downloadForOffline: (contentType: string, contentId: string) => Promise<boolean>;
  removeOfflineContent: (contentType: string, contentId: string) => void;
  syncOfflineProgress: () => Promise<boolean>;
  isContentDownloaded: (contentType: string, contentId: string) => boolean;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineContent, setOfflineContent] = useState<{
    questions: any[];
    studyMaterials: any[];
  }>(() => {
    // Initialize from localStorage if available
    const savedContent = localStorage.getItem('offlineContent');
    return savedContent
      ? JSON.parse(savedContent)
      : { questions: [], studyMaterials: [] };
  });
  
  const [pendingActions, setPendingActions] = useState<any[]>(() => {
    // Initialize from localStorage if available
    const savedActions = localStorage.getItem('pendingOfflineActions');
    return savedActions ? JSON.parse(savedActions) : [];
  });
  
  const { token } = useAuth();
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Save offline content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineContent', JSON.stringify(offlineContent));
  }, [offlineContent]);
  
  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pendingOfflineActions', JSON.stringify(pendingActions));
  }, [pendingActions]);
  
  // Try to sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && token) {
      syncOfflineProgress();
    }
  }, [isOnline, pendingActions.length, token]);
  
  const downloadForOffline = async (contentType: string, contentId: string) => {
    if (!isOnline) {
      return false;
    }
    
    try {
      let endpoint = '';
      
      if (contentType === 'questions') {
        endpoint = `/api/questions/${contentId}`;
      } else if (contentType === 'studyMaterials') {
        endpoint = `/api/studyplan/materials/${contentId}`;
      } else {
        throw new Error('Invalid content type');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const content = await response.json();
      
      setOfflineContent(prev => {
        const updatedContent = { ...prev };
        
        // Check if content already exists
        const existingIndex = updatedContent[contentType].findIndex(
          (item: any) => item._id === contentId
        );
        
        if (existingIndex >= 0) {
          // Update existing content
          updatedContent[contentType][existingIndex] = content;
        } else {
          // Add new content
          updatedContent[contentType] = [...updatedContent[contentType], content];
        }
        
        return updatedContent;
      });
      
      return true;
    } catch (error) {
      console.error('Error downloading content for offline use:', error);
      return false;
    }
  };
  
  const removeOfflineContent = (contentType: string, contentId: string) => {
    setOfflineContent(prev => {
      const updatedContent = { ...prev };
      
      updatedContent[contentType] = updatedContent[contentType].filter(
        (item: any) => item._id !== contentId
      );
      
      return updatedContent;
    });
  };
  
  const addPendingAction = (action: any) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };
  
  const syncOfflineProgress = async () => {
    if (!isOnline || !token || pendingActions.length === 0) {
      return false;
    }
    
    try {
      // Send all pending actions to the server
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actions: pendingActions }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync offline progress');
      }
      
      // Clear pending actions after successful sync
      setPendingActions([]);
      return true;
    } catch (error) {
      console.error('Error syncing offline progress:', error);
      return false;
    }
  };
  
  const isContentDownloaded = (contentType: string, contentId: string) => {
    return offlineContent[contentType].some((item: any) => item._id === contentId);
  };
  
  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        offlineContent,
        downloadForOffline,
        removeOfflineContent,
        syncOfflineProgress,
        isContentDownloaded,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext; 