import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getPublicSharedNotes, 
  getUserNotes, 
  SharedNote 
} from '../../services/sharedNoteService';
import PremiumFeatureGuard from '../../components/subscription/PremiumFeatureGuard';

const SharedNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('my');
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [filters, setFilters] = useState<{
    subject?: string;
    topic?: string;
    tag?: string;
  }>({});

  // List of subjects and topics for filtering
  const subjects = ['Math', 'Reading', 'Writing', 'English', 'Science', 'SAT', 'ACT', 'General'];

  useEffect(() => {
    fetchNotes();
  }, [activeTab, page, filters]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'public') {
        const response = await getPublicSharedNotes(
          page, 
          10, 
          filters.subject, 
          filters.topic
        );
        setNotes(response.notes);
        setTotalPages(response.pages);
      } else {
        const userNotes = await getUserNotes();
        setNotes(userNotes);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notes');
      console.error('Error fetching notes:', err);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Content to display when premium access is required
  const premiumFallback = (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Notes - Premium Feature</h2>
        <p className="text-gray-600 mb-6">
          Shared Notes allow you to create, share, and access study materials created by other students.
          Subscribe to access this feature and enhance your learning experience.
        </p>
        <Link
          to="/pricing"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
        >
          View Subscription Plans
        </Link>
      </div>
    </div>
  );

  // Main content wrapped with PremiumFeatureGuard
  return (
    <PremiumFeatureGuard fallback={premiumFallback}>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Shared Notes</h1>
          <Link
            to="/shared-notes/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create New Note
          </Link>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Notes
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'public'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Public Notes
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'public' && (
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={filters.subject || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={filters.topic || ''}
                onChange={(e) => setFilters({...filters, topic: e.target.value || undefined})}
                placeholder="Search by topic..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center my-4">
            <p className="text-gray-600">
              {activeTab === 'public' 
                ? 'No public notes available matching your filters.' 
                : 'You haven\'t created any notes yet.'}
            </p>
            <Link 
              to="/shared-notes/create" 
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Create Your First Note
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notes.map((note) => (
              <div key={note._id} className="py-4">
                <Link
                  to={`/shared-notes/${note._id}`}
                  className="block hover:bg-gray-50 p-2 rounded"
                >
                  <h3 className="text-lg font-medium text-blue-600">{note.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      By: {note.author.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {note.subject}
                    </span>
                    {note.visibility === 'public' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Public
                      </span>
                    )}
                    {note.visibility === 'private' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Private
                      </span>
                    )}
                    {note.visibility === 'group' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Group
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">{note.content.substring(0, 150)}...</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {note.upvotes.length}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      {note.downvotes.length}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      {note.comments.length}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {activeTab === 'public' && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`mr-2 p-2 rounded ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
              >
                Previous
              </button>
              
              <div className="flex items-center">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`mx-1 w-8 h-8 rounded-full ${
                      page === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'text-blue-500 hover:bg-blue-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`ml-2 p-2 rounded ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </PremiumFeatureGuard>
  );
};

export default SharedNotes; 