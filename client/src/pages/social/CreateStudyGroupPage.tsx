import React from 'react';
import { Link } from 'react-router-dom';
import CreateStudyGroup from '../../components/social/CreateStudyGroup';

const CreateStudyGroupPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <Link to="/study-groups" className="text-blue-500 hover:text-blue-700 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Study Groups
        </Link>
      </div>
      
      <CreateStudyGroup />
    </div>
  );
};

export default CreateStudyGroupPage; 