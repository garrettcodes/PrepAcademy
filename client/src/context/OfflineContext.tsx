import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define types for the offline content
export interface Question {
  _id: string;
  text: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: Array<{
    _id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  category: string;
  tags: string[];
}

export interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  content: string;
  subject: string;
  topic: string;
  type: 'text' | 'video' | 'interactive';
  duration?: number;
  resourceUrl?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface PendingAction {
  type: 'answer' | 'progress' | 'note' | 'bookmark' | 'COMPLETE_ONBOARDING_STEP' | 'SKIP_ONBOARDING' | 'RESET_ONBOARDING' | 'UPDATE_STRESS_MANAGEMENT_PROGRESS';
  contentType?: 'question' | 'studyMaterial' | 'questions' | 'studyMaterials' | 'stressManagement';
  contentId?: string;
  data: Record<string, any>;
  timestamp: number;
}

interface OfflineContextType {
  isOnline: boolean;
  offlineContent: {
    questions: Question[];
    studyMaterials: StudyMaterial[];
    stressManagement: any[];
  };
  pendingActions: PendingAction[];
  downloadForOffline: (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => Promise<boolean>;
  removeOfflineContent: (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => void;
  syncOfflineProgress: () => Promise<boolean>;
  isContentDownloaded: (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => boolean;
  addPendingAction: (action: Omit<PendingAction, 'timestamp'>) => void;
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
    questions: Question[];
    studyMaterials: StudyMaterial[];
    stressManagement: any[];
  }>(() => {
    // Initialize from localStorage if available
    const savedContent = localStorage.getItem('offlineContent');
    return savedContent
      ? JSON.parse(savedContent)
      : { questions: [], studyMaterials: [], stressManagement: [] };
  });
  
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
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
  
  const downloadForOffline = async (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => {
    if (!isOnline) {
      return false;
    }
    
    try {
      let endpoint = '';
      
      if (contentType === 'questions') {
        endpoint = `/api/questions/${contentId}`;
      } else if (contentType === 'studyMaterials') {
        endpoint = `/api/studyplan/materials/${contentId}`;
      } else if (contentType === 'stressManagement') {
        endpoint = `/api/stress-management/${contentId}`;
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
          (item) => item._id === contentId
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
  
  const removeOfflineContent = (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => {
    setOfflineContent((prevContent) => {
      const updatedContent = { ...prevContent };
      if (Array.isArray(updatedContent[contentType])) {
        updatedContent[contentType] = updatedContent[contentType].filter(
          (item: { _id: string }) => item._id !== contentId
        );
      }
      
      localStorage.setItem('offlineContent', JSON.stringify(updatedContent));
      return updatedContent;
    });
  };
  
  const addPendingAction = (action: Omit<PendingAction, 'timestamp'>) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };
  
  const syncOfflineProgress = async () => {
    if (!isOnline || !token || pendingActions.length === 0) {
      return false;
    }
    
    try {
      // Group pending actions by type for batch processing
      const actionsByType = pendingActions.reduce((groups, action) => {
        const key = action.type;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(action);
        return groups;
      }, {} as Record<string, PendingAction[]>);
      
      const syncPromises = [];
      
      // Process each type of action
      for (const [actionType, actions] of Object.entries(actionsByType)) {
        let endpoint = '';
        
        switch (actionType) {
          case 'answer':
            endpoint = '/api/user-progress/batch-answers';
            break;
          case 'progress':
            endpoint = '/api/user-progress/batch-progress';
            break;
          case 'note':
            endpoint = '/api/notes/batch';
            break;
          case 'bookmark':
            endpoint = '/api/bookmarks/batch';
            break;
          default:
            continue;
        }
        
        // Send batch request
        syncPromises.push(
          fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ actions }),
          })
        );
      }
      
      // Wait for all sync requests to complete
      await Promise.all(syncPromises);
      
      // Clear all pending actions
      setPendingActions([]);
      
      return true;
    } catch (error) {
      console.error('Error syncing offline progress:', error);
      return false;
    }
  };
  
  const isContentDownloaded = (contentType: 'questions' | 'studyMaterials' | 'stressManagement', contentId: string) => {
    return offlineContent[contentType]?.some(item => item._id === contentId) || false;
  };
  
  const value = {
    isOnline,
    offlineContent,
    pendingActions,
    downloadForOffline,
    removeOfflineContent,
    syncOfflineProgress,
    isContentDownloaded,
    addPendingAction,
  };
  
  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext; 