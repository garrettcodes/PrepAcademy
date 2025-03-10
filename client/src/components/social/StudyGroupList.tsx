import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getPublicStudyGroups, 
  getUserStudyGroups, 
  StudyGroup 
} from '../../services/studyGroupService';

interface StudyGroupListProps {
  type: 'public' | 'user';
  topicFilter?: string;
}

const StudyGroupList: React.FC<StudyGroupListProps> = ({ type, topicFilter }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (type === 'public') {
          const response = await getPublicStudyGroups(page, 6, topicFilter);
          setGroups(response.groups);
          setTotalPages(response.pages);
        } else {
          const userGroups = await getUserStudyGroups();
          setGroups(userGroups);
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load study groups');
        console.error('Error fetching study groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [type, page, topicFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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

  if (groups.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center my-4">
        <p className="text-gray-600">
          {type === 'public' 
            ? 'No public study groups available. Why not create one?' 
            : 'You are not a member of any study groups.'}
        </p>
        <Link 
          to="/study-groups/create" 
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create Study Group
        </Link>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-blue-600 truncate">{group.name}</h3>
                {group.isPrivate && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Private
                  </span>
                )}
              </div>
              
              <p className="text-gray-500 text-sm mt-1 mb-2">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
              
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{group.description}</p>
              
              <div className="mb-4 flex flex-wrap gap-1">
                {group.topics.slice(0, 3).map((topic, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {topic}
                  </span>
                ))}
                {group.topics.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    +{group.topics.length - 3} more
                  </span>
                )}
              </div>
              
              <Link 
                to={`/study-groups/${group._id}`} 
                className="w-full inline-block text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                View Group
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {type === 'public' && totalPages > 1 && (
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
  );
};

export default StudyGroupList; 