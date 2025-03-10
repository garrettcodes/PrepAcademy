import React, { useState } from 'react';
import { useOffline } from '../../context/OfflineContext';

const OfflineIndicator: React.FC = () => {
  const { isOnline, offlineContent, syncOfflineProgress } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineProgress();
    setIsSyncing(false);
  };
  
  const totalOfflineItems = 
    offlineContent.questions.length + 
    offlineContent.studyMaterials.length;
  
  if (isOnline && totalOfflineItems === 0) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-lg ${
      isOnline ? 'bg-white' : 'bg-yellow-50'
    }`}>
      <div className="p-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isOnline ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <div className="font-medium">
            {isOnline ? 'Online' : 'Offline Mode'}
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 border-t pt-2">
            <div className="text-sm text-gray-600 mb-2">
              {totalOfflineItems > 0 ? (
                <div>
                  <p>{totalOfflineItems} items available offline</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {offlineContent.questions.length > 0 && (
                      <li>• {offlineContent.questions.length} practice questions</li>
                    )}
                    {offlineContent.studyMaterials.length > 0 && (
                      <li>• {offlineContent.studyMaterials.length} study materials</li>
                    )}
                  </ul>
                </div>
              ) : (
                <p>No content available offline</p>
              )}
            </div>
            
            {isOnline && totalOfflineItems > 0 && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full py-1 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                {isSyncing ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Syncing...
                  </span>
                ) : (
                  'Sync Progress'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator; 