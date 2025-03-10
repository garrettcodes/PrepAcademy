import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Question {
  _id: string;
  question: string;
  options: string[];
  format: string;
  subject: string;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  format: string;
}

const MiniAssessment: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { checkMiniAssessmentStatus } = useAuth();

  // Fetch mini-assessment questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/mini-assessment/questions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setQuestions(response.data.questions);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching mini-assessment questions:', err);
        setError(err.response?.data?.message || 'Error fetching questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Handle answer selection
  const handleAnswerSelect = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Create new answer
    const newAnswer: Answer = {
      questionId: currentQuestion._id,
      selectedAnswer: option,
      format: currentQuestion.format
    };
    
    // Update answers array
    const updatedAnswers = [...answers];
    const existingAnswerIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion._id);
    
    if (existingAnswerIndex >= 0) {
      updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    
    setAnswers(updatedAnswers);
    
    // Move to next question after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  // Handle navigation to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle navigation to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Handle test submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Submit answers
      const response = await axios.post(
        `${API_URL}/mini-assessment/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setResult(response.data);
      setSubmitting(false);
      
      // Update mini-assessment status in context
      checkMiniAssessmentStatus();
    } catch (err: any) {
      console.error('Error submitting mini-assessment:', err);
      setError(err.response?.data?.message || 'Error submitting assessment');
      setSubmitting(false);
    }
  };

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading mini-assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Mini-Assessment Complete!</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Your Learning Style</h3>
          <p className="text-gray-700">
            {result.learningStyleChanged 
              ? `Your learning style has been updated to: ${result.learningStyle}`
              : `Your learning style remains: ${result.learningStyle}`
            }
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc pl-5">
            {result.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-gray-700 mb-1">{rec}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Next Assessment</h3>
          <p className="text-gray-700">
            Your next mini-assessment will be due on {new Date(result.nextMiniAssessmentDate).toLocaleDateString()}.
          </p>
        </div>
        
        <button
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">No Assessment Due</h2>
        <p className="text-gray-700 mb-4">You don't have a mini-assessment due at this time.</p>
        <button
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?._id);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Learning Style Mini-Assessment</h1>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="text-gray-600">Format: {currentQuestion.format}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                currentAnswer?.selectedAnswer === option ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded ${
            currentQuestionIndex === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous
        </button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers.length < questions.length || submitting}
            className={`px-4 py-2 rounded ${
              answers.length < questions.length || submitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MiniAssessment; 