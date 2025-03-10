import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';

interface ContentReview {
  _id: string;
  contentType: string;
  contentId: string;
  flaggedBy: {
    _id: string;
    name: string;
    email: string;
  };
  flaggedAt: string;
  status: 'pending' | 'reviewed' | 'updated' | 'rejected';
  reason: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  comments?: string;
  resolution?: string;
}

const ContentReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Build query params
        let queryParams = '?';
        if (filter !== 'all') {
          queryParams += `status=${filter}&`;
        }
        if (contentTypeFilter !== 'all') {
          queryParams += `contentType=${contentTypeFilter}&`;
        }

        // Get reviews
        const response = await axios.get(`${API_URL}/content-review/pending${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReviews(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching content reviews:', err);
        setError(err.response?.data?.message || 'Failed to fetch reviews');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [filter, contentTypeFilter]);

  const handleViewReview = (reviewId: string) => {
    navigate(`/admin/review/${reviewId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Reviews</h1>
        <Link
          to="/admin/dashboard"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Filter Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="updated">Updated</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                className="w-full p-2 border rounded"
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="question">Questions</option>
                <option value="exam">Exams</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Content Type</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Flagged By</th>
                  <th className="px-4 py-3 text-left">Flagged At</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 capitalize">{review.contentType}</td>
                    <td className="px-4 py-3">
                      {review.reason.length > 50
                        ? `${review.reason.substring(0, 50)}...`
                        : review.reason}
                    </td>
                    <td className="px-4 py-3">{review.flaggedBy?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{new Date(review.flaggedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${review.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${review.status === 'updated' ? 'bg-green-100 text-green-800' : ''}
                          ${review.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewReview(review._id)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No reviews found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentReviews; 