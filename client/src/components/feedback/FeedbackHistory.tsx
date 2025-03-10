import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFeedback, Feedback, deleteFeedback } from '../../services/feedbackService';

const FeedbackHistory: React.FC = () => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchUserFeedback();
  }, []);

  const fetchUserFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const feedback = await getUserFeedback();
      setFeedbackItems(feedback);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback history');
      console.error('Error fetching feedback history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    
    try {
      await deleteFeedback(id);
      setFeedbackItems(feedbackItems.filter(item => item._id !== id));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete feedback');
      console.error('Error deleting feedback:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
        return 'bg-blue-100 text-blue-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Feedback History</h2>
        <p className="text-gray-600 mb-4">You haven't submitted any feedback yet.</p>
        <Link
          to="/feedback/new"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit Feedback
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Feedback History</h2>
        <Link
          to="/feedback/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          New Feedback
        </Link>
      </div>
      
      <div className="divide-y divide-gray-200">
        {feedbackItems.map((item) => (
          <div key={item._id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-500">
                    Submitted on {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/feedback/${item._id}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View
                </Link>
                
                {item.status === 'pending' && (
                  <button
                    onClick={() => setShowDeleteConfirm(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            
            <p className="mt-2 text-gray-600 line-clamp-2">{item.description}</p>
            
            {item.response && (
              <div className="mt-3 bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800">Response:</p>
                <p className="text-sm text-blue-700">{item.response}</p>
              </div>
            )}
            
            {showDeleteConfirm === item._id && (
              <div className="mt-3 p-3 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-red-700 mb-2">
                  Are you sure you want to delete this feedback?
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteLoading}
                    className={`px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 ${
                      deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackHistory; 