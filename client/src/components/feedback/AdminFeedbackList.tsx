import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllFeedback, 
  Feedback, 
  updateFeedbackStatus, 
  UpdateFeedbackStatusData,
  deleteFeedback
} from '../../services/feedbackService';

const AdminFeedbackList: React.FC = () => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<{
    status?: string;
    category?: string;
    priority?: string;
  }>({});
  
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<UpdateFeedbackStatusData>({
    status: undefined,
    priority: undefined,
    adminNotes: '',
    response: '',
  });
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchFeedback();
  }, [page, filters]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllFeedback(page, 10, filters);
      setFeedbackItems(result.feedback);
      setTotalPages(result.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters };
    
    if (value === '') {
      delete newFilters[name as keyof typeof filters];
    } else {
      newFilters[name as keyof typeof filters] = value;
    }
    
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdateData({
      ...updateData,
      [name]: value,
    });
  };

  const handleUpdate = async (id: string) => {
    if (!id) return;
    setActionLoading(true);
    
    try {
      await updateFeedbackStatus(id, updateData);
      
      // Update the local state with the new data
      const updatedItems = feedbackItems.map(item => {
        if (item._id === id) {
          return {
            ...item,
            status: updateData.status || item.status,
            priority: updateData.priority || item.priority,
            adminNotes: updateData.adminNotes || item.adminNotes,
            response: updateData.response || item.response,
          };
        }
        return item;
      });
      
      setFeedbackItems(updatedItems);
      setShowUpdateForm(false);
      setUpdateData({
        status: undefined,
        priority: undefined,
        adminNotes: '',
        response: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update feedback');
      console.error('Error updating feedback:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setActionLoading(true);
    
    try {
      await deleteFeedback(id);
      setFeedbackItems(feedbackItems.filter(item => item._id !== id));
      setShowDeleteConfirm(false);
      setActiveItem(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete feedback');
      console.error('Error deleting feedback:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const selectItem = (id: string) => {
    if (activeItem === id) {
      setActiveItem(null);
      setShowUpdateForm(false);
      setShowDeleteConfirm(false);
    } else {
      setActiveItem(id);
      setShowUpdateForm(false);
      setShowDeleteConfirm(false);
      
      // Pre-fill update form with current values
      const item = feedbackItems.find(f => f._id === id);
      if (item) {
        setUpdateData({
          status: item.status as any,
          priority: item.priority as any,
          adminNotes: item.adminNotes || '',
          response: item.response || '',
        });
      }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && page === 1) {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Feedback</h2>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-40">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="implemented">Implemented</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="w-40">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="question">Question</option>
            <option value="content">Content</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="w-40">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={filters.priority || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      
      {/* Feedback List */}
      {feedbackItems.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded">
          <p className="text-gray-700">No feedback items found matching your filters.</p>
        </div>
      ) : (
        <div>
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbackItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${activeItem === item._id ? 'bg-blue-50' : ''}`}
                      onClick={() => selectItem(item._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectItem(item._id);
                            setShowUpdateForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Update
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectItem(item._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    
                    {/* Details Panel */}
                    {activeItem === item._id && !showUpdateForm && !showDeleteConfirm && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm text-gray-700">
                            <div className="font-medium text-gray-900 mb-2">Description:</div>
                            <p className="mb-4 whitespace-pre-wrap">{item.description}</p>
                            
                            {item.relatedTo && (
                              <div className="mb-4">
                                <span className="font-medium text-gray-900">Related to: </span>
                                <span className="text-gray-700">
                                  {item.relatedTo.type.charAt(0).toUpperCase() + item.relatedTo.type.slice(1)} (ID: {item.relatedTo.id})
                                </span>
                              </div>
                            )}
                            
                            {item.adminNotes && (
                              <div className="mb-4">
                                <div className="font-medium text-gray-900 mb-1">Admin Notes:</div>
                                <p className="text-gray-700 bg-yellow-50 p-2 rounded">{item.adminNotes}</p>
                              </div>
                            )}
                            
                            {item.response && (
                              <div className="mb-1">
                                <div className="font-medium text-gray-900 mb-1">Response to User:</div>
                                <p className="text-gray-700 bg-blue-50 p-2 rounded">{item.response}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => setShowUpdateForm(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Update Status
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Update Form */}
                    {activeItem === item._id && showUpdateForm && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h4 className="font-medium text-lg text-gray-900 mb-4">Update Feedback</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label htmlFor="update-status" className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                  id="update-status"
                                  name="status"
                                  value={updateData.status || item.status}
                                  onChange={handleUpdateChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="under-review">Under Review</option>
                                  <option value="implemented">Implemented</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="closed">Closed</option>
                                </select>
                              </div>
                              
                              <div>
                                <label htmlFor="update-priority" className="block text-sm font-medium text-gray-700 mb-1">
                                  Priority
                                </label>
                                <select
                                  id="update-priority"
                                  name="priority"
                                  value={updateData.priority || item.priority}
                                  onChange={handleUpdateChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="critical">Critical</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="update-adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Notes (internal only)
                              </label>
                              <textarea
                                id="update-adminNotes"
                                name="adminNotes"
                                value={updateData.adminNotes}
                                onChange={handleUpdateChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="update-response" className="block text-sm font-medium text-gray-700 mb-1">
                                Response to User
                              </label>
                              <textarea
                                id="update-response"
                                name="response"
                                value={updateData.response}
                                onChange={handleUpdateChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                This response will be visible to the user and they will be notified via email.
                              </p>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                onClick={() => setShowUpdateForm(false)}
                                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdate(item._id)}
                                disabled={actionLoading}
                                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  actionLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                              >
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Delete Confirmation */}
                    {activeItem === item._id && showDeleteConfirm && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-red-50">
                          <div className="text-sm">
                            <h4 className="font-medium text-lg text-red-700 mb-2">Delete Feedback</h4>
                            <p className="text-red-600 mb-4">
                              Are you sure you want to delete this feedback item? This action cannot be undone.
                            </p>
                            
                            <div className="flex justify-end">
                              <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={actionLoading}
                                className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                  actionLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                              >
                                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`mr-2 p-2 rounded ${
                    page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show a window of pages around the current page
                    const windowSize = 2;
                    const startPage = Math.max(1, page - windowSize);
                    const endPage = Math.min(totalPages, page + windowSize);
                    
                    // If we can show 5 pages, adjust the window
                    const displayWindow = Math.min(5, totalPages);
                    const adjustedStart = Math.max(1, Math.min(startPage, totalPages - displayWindow + 1));
                    
                    const pageNum = adjustedStart + i;
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`mx-1 w-8 h-8 rounded-full ${
                            pageNum === page
                              ? 'bg-blue-500 text-white'
                              : 'text-blue-500 hover:bg-blue-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`ml-2 p-2 rounded ${
                    page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackList; 