import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStressManagement } from '../context/StressManagementContext';
import DownloadForOfflineButton from '../components/ui/DownloadForOfflineButton';

const StressManagementDetail: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const { 
    currentContent, 
    loading, 
    error, 
    fetchContentById, 
    updateProgress 
  } = useStressManagement();
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (contentId) {
      fetchContentById(contentId);
    }
  }, [contentId, fetchContentById]);
  
  useEffect(() => {
    // Initialize state from content
    if (currentContent?.userProgress) {
      setRating(currentContent.userProgress.rating);
      setNotes(currentContent.userProgress.notes || '');
      setIsFavorite(currentContent.userProgress.favorite);
    }
  }, [currentContent]);
  
  const handleProgress = async (progress: number) => {
    if (!contentId) return;
    
    await updateProgress(contentId, { progress });
  };
  
  const handleComplete = async () => {
    if (!contentId) return;
    
    setIsCompleting(true);
    const success = await updateProgress(contentId, { 
      completed: true,
      progress: 100 
    });
    setIsCompleting(false);
    
    if (success) {
      setShowFeedback(true);
    }
  };
  
  const handleFeedbackSubmit = async () => {
    if (!contentId) return;
    
    await updateProgress(contentId, { rating, notes });
    setShowFeedback(false);
  };
  
  const toggleFavorite = async () => {
    if (!contentId) return;
    
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    await updateProgress(contentId, { favorite: newValue });
  };
  
  const getContentComponent = () => {
    if (!currentContent) return null;
    
    switch (currentContent.type) {
      case 'article':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
          </div>
        );
        
      case 'exercise':
        return (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold mb-4">Exercise Instructions</h3>
            <div className="prose prose-blue max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleProgress(50)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
              >
                Start Exercise
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Exercise
              </button>
            </div>
          </div>
        );
        
      case 'audio':
        return (
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold mb-4">Audio Session</h3>
            <div className="prose prose-purple max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
            </div>
            {currentContent.mediaUrl && (
              <div className="my-4">
                <audio
                  controls
                  className="w-full"
                  onPlay={() => handleProgress(25)}
                  onEnded={handleComplete}
                >
                  <source src={currentContent.mediaUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-semibold mb-4">Video Tutorial</h3>
            <div className="prose prose-indigo max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
            </div>
            {currentContent.mediaUrl && (
              <div className="my-4 aspect-w-16 aspect-h-9">
                <iframe
                  src={currentContent.mediaUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                  onLoadStart={() => handleProgress(25)}
                ></iframe>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Mark as Watched
              </button>
            </div>
          </div>
        );
        
      case 'interactive':
        return (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold mb-4">Interactive Exercise</h3>
            <div className="prose prose-green max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleProgress(33)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
              >
                Begin Exercise
              </button>
              <button
                onClick={() => handleProgress(66)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors mr-4"
              >
                Continue
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Exercise
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
          </div>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600 border border-red-200 m-6">
        {error}
      </div>
    );
  }
  
  if (!currentContent) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg m-6">
        <p className="text-gray-500">Content not found.</p>
        <Link 
          to="/stress-management"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Stress Management
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          to="/stress-management" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Stress Management
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{currentContent.title}</h1>
            
            <div className="flex items-center">
              <button
                onClick={toggleFavorite}
                className={`mr-2 text-2xl ${isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                ★
              </button>
              
              <DownloadForOfflineButton
                contentType="stressManagement"
                contentId={currentContent._id}
              />
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {currentContent.duration || 5} min
            </span>
            
            <span className="mx-2">•</span>
            
            <span className="capitalize">{currentContent.category}</span>
            
            {currentContent.tags && currentContent.tags.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {currentContent.tags.map((tag, index) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            )}
            
            {currentContent.userProgress?.completed && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              </>
            )}
          </div>
          
          <p className="text-gray-600 mb-6">{currentContent.description}</p>
          
          {getContentComponent()}
          
          {!currentContent.userProgress?.completed && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                {isCompleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Completing...
                  </span>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Great job!</h2>
            <p className="mb-4">How would you rate this content?</p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    (rating || 0) >= star ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes or reflections about this content..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StressManagementDetail; 