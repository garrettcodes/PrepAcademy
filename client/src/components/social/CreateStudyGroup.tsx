import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudyGroup, CreateStudyGroupData } from '../../services/studyGroupService';

const CreateStudyGroup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateStudyGroupData>({
    name: '',
    description: '',
    topics: [],
    isPrivate: false
  });
  const [topicInput, setTopicInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicInput(e.target.value);
  };

  const addTopic = () => {
    const trimmedTopic = topicInput.trim();
    if (trimmedTopic && !formData.topics.includes(trimmedTopic)) {
      setFormData({
        ...formData,
        topics: [...formData.topics, trimmedTopic]
      });
      setTopicInput('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter(topic => topic !== topicToRemove)
    });
  };

  const handleTopicKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.topics.length === 0) {
      setError('Please add at least one topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newGroup = await createStudyGroup(formData);
      navigate(`/study-groups/${newGroup._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create study group');
      console.error('Error creating study group:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a Study Group</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter a name for your study group"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={50}
            required
          />
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
            placeholder="What will your group focus on? What can members expect?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={500}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Topics <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              value={topicInput}
              onChange={handleTopicChange}
              onKeyPress={handleTopicKeyPress}
              placeholder="Add a topic (e.g., SAT Math, ACT Science)"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addTopic}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {formData.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.topics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1"
                >
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="ml-2 text-blue-800 hover:text-blue-900 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Make this group private</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Private groups require a join code and are not visible in public search results.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/study-groups')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudyGroup; 