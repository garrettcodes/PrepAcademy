import React, { useState } from 'react';
import FlagContentButton from '../FlagContentButton';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  id: string;
  questionText: string;
  options: Option[];
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  isSubmitted?: boolean;
  correctOption?: string;
  explanation?: string;
  subject?: string;
  difficulty?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  id,
  questionText,
  options,
  selectedOption,
  onSelectOption,
  isSubmitted = false,
  correctOption,
  explanation,
  subject,
  difficulty
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getOptionClassName = (optionId: string) => {
    const baseClasses = 'p-4 mb-3 rounded-lg border border-gray-300 transition-colors cursor-pointer';
    
    if (!isSubmitted) {
      return selectedOption === optionId
        ? `${baseClasses} bg-primary-100 border-primary-300`
        : `${baseClasses} hover:bg-gray-100`;
    }
    
    if (optionId === correctOption) {
      return `${baseClasses} bg-green-100 border-green-500`;
    }
    
    if (selectedOption === optionId && optionId !== correctOption) {
      return `${baseClasses} bg-red-100 border-red-500`;
    }
    
    return `${baseClasses} opacity-70`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 relative">
      {/* Question header with flag button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {subject && difficulty && (
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-medium text-primary-700">{subject}</span> • 
              <span className="capitalize ml-1">{difficulty}</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <FlagContentButton 
            contentType="question"
            contentId={id}
            iconOnly
          />
        </div>
      </div>
      
      {/* Question text */}
      <h3 className="text-xl font-semibold mb-6">{questionText}</h3>
      
      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <div
            key={option.id}
            className={getOptionClassName(option.id)}
            onClick={() => !isSubmitted && onSelectOption(option.id)}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-400 mr-3">
                {selectedOption === option.id && (
                  <div className={`w-4 h-4 rounded-full ${isSubmitted && option.id !== correctOption ? 'bg-red-500' : 'bg-primary'}`}></div>
                )}
              </div>
              <span>{option.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Explanation (visible after submission) */}
      {isSubmitted && (
        <div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-primary font-medium flex items-center focus:outline-none"
          >
            <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
            <svg className={`ml-1 w-5 h-5 transition-transform ${showExplanation ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showExplanation && explanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-gray-800">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard; 