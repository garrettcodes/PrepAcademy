import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../services/api';

interface ContentUpdate {
  _id: string;
  contentType: string;
  contentId: {
    _id: string;
    text?: string;
    title?: string;
  };
  status: string;
  reason: string;
  satActChangeReference: string;
  updatedAt: string;
  flaggedBy: {
    name: string;
    email: string;
  };
  reviewedBy: {
    name: string;
    email: string;
  };
}

const SatActUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // New update form state
  const [showForm, setShowForm] = useState<boolean>(false);
  const [contentType, setContentType] = useState<string>('question');
  const [contentId, setContentId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [satActReference, setSatActReference] = useState<string>('');
  const [updatedContent, setUpdatedContent] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/content-review/sat-act-updates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUpdates(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching SAT/ACT updates:', err);
        setError(err.response?.data?.message || 'Failed to fetch updates');
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [success]);

  const fetchContentDetails = async () => {
    if (!contentId) return;
    
    try {
      setFormError(null);
      const token = localStorage.getItem('token');
      const endpoint = contentType === 'question' 
        ? `${API_URL}/questions/${contentId}`
        : `${API_URL}/exams/${contentId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUpdatedContent(response.data);
    } catch (err: any) {
      console.error('Error fetching content details:', err);
      setFormError('Content not found. Please check the ID.');
      setUpdatedContent({});
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentId || !reason || !satActReference) {
      setFormError('All fields are required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        contentType,
        contentId,
        reason,
        satActChangeReference: satActReference,
        updatedContent
      };
      
      await axios.post(`${API_URL}/content-review/sat-act-update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form
      setContentType('question');
      setContentId('');
      setReason('');
      setSatActReference('');
      setUpdatedContent({});
      setShowForm(false);
      
      // Show success message
      setSuccess('Content updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting update:', err);
      setFormError(err.response?.data?.message || 'Failed to submit update');
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUpdatedContent({
      ...updatedContent,
      [e.target.name]: e.target.value
    });
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
        <h1 className="text-3xl font-bold">SAT/ACT Content Updates</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
          >
            {showForm ? 'Cancel' : 'Create New Update'}
          </button>
          <Link
            to="/admin/dashboard"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Create SAT/ACT Content Update</h2>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmitUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  <option value="question">Question</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content ID</label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-l"
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    placeholder="Enter content ID"
                  />
                  <button
                    type="button"
                    onClick={fetchContentDetails}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-r"
                  >
                    Fetch
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Update</label>
              <textarea
                className="w-full p-2 border rounded h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why this content needs to be updated..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">SAT/ACT Change Reference</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={satActReference}
                onChange={(e) => setSatActReference(e.target.value)}
                placeholder="Reference to official SAT/ACT change documentation"
              />
            </div>
            
            {Object.keys(updatedContent).length > 0 && contentType === 'question' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Edit Content</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea
                    name="text"
                    className="w-full p-2 border rounded h-24"
                    value={updatedContent.text || ''}
                    onChange={handleContentChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                  <input
                    type="text"
                    name="correctAnswer"
                    className="w-full p-2 border rounded"
                    value={updatedContent.correctAnswer || ''}
                    onChange={handleContentChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      name="subject"
                      className="w-full p-2 border rounded"
                      value={updatedContent.subject || ''}
                      onChange={(e) => setUpdatedContent({...updatedContent, subject: e.target.value})}
                    >
                      <option value="Math">Math</option>
                      <option value="Reading">Reading</option>
                      <option value="Writing">Writing</option>
                      <option value="English">English</option>
                      <option value="Science">Science</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      name="difficulty"
                      className="w-full p-2 border rounded"
                      value={updatedContent.difficulty || ''}
                      onChange={(e) => setUpdatedContent({...updatedContent, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              >
                Submit Update
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Updates</h2>
        </div>
        
        {updates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Content Type</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">SAT/ACT Reference</th>
                  <th className="px-4 py-3 text-left">Updated By</th>
                  <th className="px-4 py-3 text-left">Update Date</th>
                  <th className="px-4 py-3 text-left">View</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((update) => (
                  <tr key={update._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 capitalize">{update.contentType}</td>
                    <td className="px-4 py-3">
                      {update.reason.length > 50
                        ? `${update.reason.substring(0, 50)}...`
                        : update.reason}
                    </td>
                    <td className="px-4 py-3">{update.satActChangeReference}</td>
                    <td className="px-4 py-3">{update.reviewedBy?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{new Date(update.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/review/${update._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No SAT/ACT updates found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SatActUpdates; 