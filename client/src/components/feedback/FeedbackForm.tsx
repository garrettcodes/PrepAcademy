import React, { useState } from 'react';
import { submitFeedback, SubmitFeedbackData } from '../../services/feedbackService';

interface FeedbackFormProps {
  onSuccess?: () => void;
  relatedTo?: {
    type: string;
    id: string;
  };
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, relatedTo }) => {
  const [formData, setFormData] = useState<SubmitFeedbackData>({
    title: '',
    description: '',
    category: 'feature',
    relatedTo: relatedTo || undefined,
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitFeedback(formData);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        relatedTo: relatedTo || undefined,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Submit Feedback</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">
            Thank you for your feedback! We'll review it as soon as possible.
          </span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="question">Question</option>
            <option value="content">Content Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of your feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide details about your feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            maxLength={2000}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/2000 characters
          </p>
        </div>
        
        {relatedTo && (
          <div className="mb-4 bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              This feedback is related to: 
              <span className="font-medium ml-1">
                {relatedTo.type.charAt(0).toUpperCase() + relatedTo.type.slice(1)}
              </span>
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm; 