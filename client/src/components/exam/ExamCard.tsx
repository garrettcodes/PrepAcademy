import React from 'react';
import { Link } from 'react-router-dom';
import FlagContentButton from '../FlagContentButton';

interface ExamCardProps {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  duration: number;
  subject: string;
  difficulty?: string;
  completedCount?: number;
  lastScore?: number;
  onStart?: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({
  id,
  title,
  description,
  questionsCount,
  duration,
  subject,
  difficulty = 'mixed',
  completedCount = 0,
  lastScore,
  onStart
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
      {/* Top section with flag button */}
      <div className="p-6 relative">
        <div className="absolute top-3 right-3">
          <FlagContentButton
            contentType="exam"
            contentId={id}
            iconOnly
          />
        </div>
        
        <div className="flex flex-col mb-4">
          <div className="flex items-center mb-2">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
              {subject}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium ml-2 capitalize">
              {difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{questionsCount} Questions</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration} min</span>
          </div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200"></div>
      
      {/* Bottom section with stats and buttons */}
      <div className="p-6 bg-gray-50 flex justify-between items-center">
        <div>
          {completedCount > 0 ? (
            <div className="text-sm">
              <span className="text-gray-600">Completed {completedCount} times</span>
              {lastScore !== undefined && (
                <p className="font-semibold text-primary-700">Last Score: {lastScore}%</p>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-600">Not attempted yet</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Link 
            to={`/exams/${id}`} 
            className="px-4 py-2 bg-primary hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
            onClick={onStart}
          >
            Start Exam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExamCard; 