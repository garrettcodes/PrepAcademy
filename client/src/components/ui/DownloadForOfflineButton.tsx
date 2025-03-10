import React, { useState } from 'react';
import { useOffline } from '../../context/OfflineContext';

interface DownloadForOfflineButtonProps {
  contentType: string;
  contentId: string;
  label?: string;
  className?: string;
}

const DownloadForOfflineButton: React.FC<DownloadForOfflineButtonProps> = ({
  contentType,
  contentId,
  label = 'Save for offline',
  className = '',
}) => {
  const { isOnline, downloadForOffline, removeOfflineContent, isContentDownloaded } = useOffline();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isDownloaded = isContentDownloaded(contentType, contentId);
  
  const handleDownload = async () => {
    if (isDownloaded) {
      removeOfflineContent(contentType, contentId);
      return;
    }
    
    setIsDownloading(true);
    await downloadForOffline(contentType, contentId);
    setIsDownloading(false);
  };
  
  if (!isOnline && !isDownloaded) {
    return null;
  }
  
  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center text-sm font-medium ${
        isDownloaded
          ? 'text-green-600 hover:text-green-800'
          : 'text-blue-600 hover:text-blue-800'
      } ${className}`}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Downloading...
        </>
      ) : isDownloaded ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Available offline
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

export default DownloadForOfflineButton; 