import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';

interface ReviewDetail {
  review: {
    _id: string;
    contentType: string;
    contentId: string;
    flaggedBy: {
      _id: string;
      name: string;
      email: string;
    };
    flaggedAt: string;
    status: string;
    reason: string;
    reviewedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    reviewedAt?: string;
    comments?: string;
    resolution?: string;
    satActChangeReference?: string;
  };
  content: any; // Content can be question or exam
}

const ReviewDetail: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  const [updatedContent, setUpdatedContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/content-review/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReviewDetail(response.data);
        setStatus(response.data.review.status);
        setComments(response.data.review.comments || '');
        setResolution(response.data.review.resolution || '');
        setUpdatedContent(response.data.content);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching review detail:', err);
        setError(err.response?.data?.message || 'Failed to fetch review detail');
        setLoading(false);
      }
    };

    if (reviewId) {
      fetchReviewDetail();
    }
  }, [reviewId]);

  const handleUpdateReview = async () => {
    try {
      if (!reviewId) return;

      const token = localStorage.getItem('token');
      const payload = {
        status,
        comments,
        resolution,
        updatedContent: isEditing ? updatedContent : undefined
      };

      await axios.put(`${API_URL}/content-review/${reviewId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Navigate back to reviews page
      navigate('/admin/reviews');
    } catch (err: any) {
      console.error('Error updating review:', err);
      setError(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (reviewDetail?.review.contentType === 'question') {
      setUpdatedContent({
        ...updatedContent,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (reviewDetail?.review.contentType === 'question') {
      const newOptions = [...updatedContent.options];
      newOptions[index] = value;
      setUpdatedContent({
        ...updatedContent,
        options: newOptions
      });
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
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

  if (!reviewDetail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-xl font-bold mb-2">Review Not Found</p>
          <Link to="/admin/reviews" className="text-blue-500 hover:text-blue-700">
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  const { review, content } = reviewDetail;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Review Content</h1>
        <Link
          to="/admin/reviews"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Reviews
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Review Details */}
        <div>
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Review Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Content Type</p>
                <p className="font-medium capitalize">{review.contentType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
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
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Flagged By</p>
                <p className="font-medium">{review.flaggedBy?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{review.flaggedBy?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Flagged At</p>
                <p className="font-medium">{new Date(review.flaggedAt).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="bg-gray-50 p-3 rounded">{review.reason}</p>
              </div>
              
              {review.satActChangeReference && (
                <div>
                  <p className="text-sm text-gray-500">SAT/ACT Reference</p>
                  <p className="bg-gray-50 p-3 rounded">{review.satActChangeReference}</p>
                </div>
              )}
              
              {review.reviewedBy && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Reviewed By</p>
                    <p className="font-medium">{review.reviewedBy.name}</p>
                    <p className="text-sm text-gray-500">{review.reviewedBy.email}</p>
                  </div>
                  
                  {review.reviewedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Reviewed At</p>
                      <p className="font-medium">{new Date(review.reviewedAt).toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Update Review</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed (No Change Needed)</option>
                  <option value="updated">Updated (Content Changed)</option>
                  <option value="rejected">Rejected (Invalid Flag)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your comments about this review..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this issue was resolved..."
                />
              </div>
              
              <button
                onClick={handleUpdateReview}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Content Details */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Content Details</h2>
              
              <button
                onClick={toggleEdit}
                className={`px-4 py-2 rounded font-medium ${
                  isEditing
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Content'}
              </button>
            </div>
            
            {review.contentType === 'question' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Question Text</p>
                  {isEditing ? (
                    <textarea
                      name="text"
                      className="w-full p-3 border rounded"
                      value={updatedContent.text}
                      onChange={handleContentChange}
                    />
                  ) : (
                    <div className="bg-gray-50 p-4 rounded">{content.text}</div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Options</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      {updatedContent.options.map((option: string, index: number) => (
                        <div key={index} className="flex">
                          <span className="bg-gray-100 p-2 w-8 text-center">{index + 1}</span>
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded-r"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {content.options.map((option: string, index: number) => (
                        <div key={index} className="flex">
                          <span className="bg-gray-100 p-2 w-8 text-center">{index + 1}</span>
                          <div className="flex-1 p-2 border rounded-r">{option}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Correct Answer</p>
                  {isEditing ? (
                    <input
                      name="correctAnswer"
                      type="text"
                      className="w-full p-2 border rounded"
                      value={updatedContent.correctAnswer}
                      onChange={handleContentChange}
                    />
                  ) : (
                    <div className="bg-green-50 p-3 rounded border border-green-200 font-medium">
                      {content.correctAnswer}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Subject</p>
                    {isEditing ? (
                      <select
                        name="subject"
                        className="w-full p-2 border rounded"
                        value={updatedContent.subject}
                        onChange={(e) => setUpdatedContent({...updatedContent, subject: e.target.value})}
                      >
                        <option value="Math">Math</option>
                        <option value="Reading">Reading</option>
                        <option value="Writing">Writing</option>
                        <option value="English">English</option>
                        <option value="Science">Science</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded">{content.subject}</div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Difficulty</p>
                    {isEditing ? (
                      <select
                        name="difficulty"
                        className="w-full p-2 border rounded"
                        value={updatedContent.difficulty}
                        onChange={(e) => setUpdatedContent({...updatedContent, difficulty: e.target.value})}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded capitalize">{content.difficulty}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Hints</p>
                  {isEditing ? (
                    <textarea
                      name="hints"
                      className="w-full p-3 border rounded"
                      value={Array.isArray(updatedContent.hints) ? updatedContent.hints.join('\n') : ''}
                      onChange={(e) => setUpdatedContent({
                        ...updatedContent,
                        hints: e.target.value.split('\n').filter(hint => hint.trim() !== '')
                      })}
                      placeholder="Enter hints, one per line"
                    />
                  ) : (
                    <div className="space-y-2">
                      {content.hints && content.hints.length > 0 ? (
                        content.hints.map((hint: string, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            {hint}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400">No hints provided</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Explanation</p>
                  {isEditing ? (
                    <textarea
                      name="explanations.text"
                      className="w-full p-3 border rounded"
                      value={updatedContent.explanations?.text || ''}
                      onChange={(e) => setUpdatedContent({
                        ...updatedContent,
                        explanations: {
                          ...(updatedContent.explanations || {}),
                          text: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded">
                      {content.explanations?.text || 'No explanation provided'}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {review.contentType === 'exam' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Exam Title</p>
                  <div className="bg-gray-50 p-3 rounded">{content.title}</div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <div className="bg-gray-50 p-3 rounded">{content.description}</div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Subject</p>
                  <div className="bg-gray-50 p-3 rounded">{content.subject}</div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Questions</p>
                  <div className="bg-gray-50 p-3 rounded">
                    {content.questions ? `${content.questions.length} questions` : '0 questions'}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Note: To edit individual questions, please review them separately
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail; 