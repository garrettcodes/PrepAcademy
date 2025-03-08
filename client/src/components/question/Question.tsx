import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface QuestionProps {
  question: {
    _id: string;
    text: string;
    options: string[];
    format?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  onAnswer: (selectedOption: string) => void;
  userAnswer?: string;
  showFeedback?: boolean;
  feedback?: {
    isCorrect: boolean;
    explanation: string;
    similarQuestions?: any[];
  } | null;
  loading?: boolean;
}

const Question: React.FC<QuestionProps> = ({ 
  question, 
  onAnswer,
  userAnswer,
  showFeedback = false,
  feedback = null,
  loading = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption);
    }
  };

  // Use provided answer if available
  const displayOption = userAnswer || selectedOption;

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-lg font-medium">{question.text}</div>
      
      {/* Image if available */}
      {question.imageUrl && (
        <div className="my-4">
          <img 
            src={question.imageUrl} 
            alt="Question visual" 
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
      
      {/* Audio if available */}
      {question.audioUrl && (
        <div className="my-4">
          <audio controls className="w-full">
            <source src={question.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {/* Option list */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              displayOption === option
                ? 'bg-primary-100 border-2 border-primary'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
            onClick={() => !showFeedback && handleOptionSelect(option)}
          >
            <div className="flex items-center">
              <div className={`h-5 w-5 flex-shrink-0 rounded-full border ${
                displayOption === option
                  ? 'bg-primary border-primary'
                  : 'border-gray-400'
              }`}>
                {displayOption === option && (
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="5" />
                  </svg>
                )}
              </div>
              <span className="ml-2">{option}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      {!showFeedback && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || loading}
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </Button>
        </div>
      )}
      
      {/* Feedback section */}
      {showFeedback && feedback && (
        <div className={`mt-6 p-4 rounded-lg ${
          feedback.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
        }`}>
          <div className="flex items-center mb-2">
            {feedback.isCorrect ? (
              <svg className="h-6 w-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <h3 className={`text-lg font-medium ${
              feedback.isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
          </div>
          
          {feedback.explanation && (
            <div className="mt-2">
              <h4 className="font-medium">Explanation:</h4>
              <p className="mt-1 text-gray-700">{feedback.explanation}</p>
            </div>
          )}
          
          {feedback.similarQuestions && feedback.similarQuestions.length > 0 && !feedback.isCorrect && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Try these similar questions:</h4>
              <ul className="list-disc list-inside space-y-1">
                {feedback.similarQuestions.map((q, index) => (
                  <li key={index} className="text-gray-700">{q.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Question; 