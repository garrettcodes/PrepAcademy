import React, { useState } from 'react';

interface QuestionProps {
  question: {
    _id: string;
    text: string;
    options: string[];
    format: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  onAnswer: (questionId: string, selectedAnswer: string) => void;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(question._id, selectedOption);
      setSelectedOption(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Question Text */}
      <h3 className="text-xl font-semibold mb-4">{question.text}</h3>

      {/* Media Content Based on Format */}
      {question.format === 'diagram' && question.imageUrl && (
        <div className="mb-6">
          <img 
            src={question.imageUrl} 
            alt="Question Diagram" 
            className="max-w-full h-auto mx-auto rounded-md border border-gray-200" 
          />
        </div>
      )}

      {question.format === 'audio' && question.audioUrl && (
        <div className="mb-6">
          <audio 
            controls 
            className="w-full"
          >
            <source src={question.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3 mt-4">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`p-3 rounded-md border cursor-pointer transition-colors ${
              selectedOption === option 
                ? 'bg-blue-50 border-blue-500' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                selectedOption === option ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
              }`}>
                {selectedOption === option && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span>{option}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedOption 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!selectedOption}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default Question; 