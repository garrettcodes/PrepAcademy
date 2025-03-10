import React, { useState, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock question for testing
const MOCK_QUESTIONS = [
  {
    _id: '1',
    text: 'What is the quadratic formula?',
    options: [
      'x = (-b ± √(b² - 4ac)) / 2a',
      'x = -b / 2a',
      'x = -b / a',
      'x = (-b ± √(b² + 4ac)) / 2a'
    ],
    correctAnswer: 'x = (-b ± √(b² - 4ac)) / 2a',
    subject: 'Math',
    difficulty: 'Medium',
    hints: ['Think about solving ax² + bx + c = 0', 'It involves a square root'],
    explanations: {
      text: 'The quadratic formula x = (-b ± √(b² - 4ac)) / 2a is used to solve quadratic equations of the form ax² + bx + c = 0.',
      visual: 'The quadratic formula can be visualized as finding the x-intercepts of a parabola on a graph. The discriminant (b² - 4ac) tells us how many solutions exist: if positive, there are two solutions; if zero, one solution; if negative, no real solutions.',
      auditory: 'The quadratic formula sounds like: "Negative b plus or minus the square root of b squared minus four a c, all divided by two a." It's like a recipe - you put in the values of a, b, and c, and get the solutions for x.',
      kinesthetic: 'Imagine the quadratic formula as a balance scale. On the left side is -b, and on the right is either +√(b² - 4ac) or -√(b² - 4ac), all balanced on a pivot point at 2a.'
    }
  },
  {
    _id: '2',
    text: 'What literary device is used when an author gives human characteristics to non-human objects?',
    options: [
      'Metaphor',
      'Simile',
      'Personification',
      'Alliteration'
    ],
    correctAnswer: 'Personification',
    subject: 'English',
    difficulty: 'Easy',
    hints: ['This device makes non-human things seem alive', 'The word has "person" in it'],
    explanations: {
      text: 'Personification is a figure of speech where human attributes are given to non-human things, like animals, objects, or abstract concepts.',
      visual: 'Picture a smiling sun with arms reaching down to warm the earth, or clouds with faces blowing wind - these are visual representations of personification.',
      auditory: 'Think of expressions like "the wind whispered," "the thunder grumbled," or "the alarm clock screamed" - these all give human voice characteristics to non-human things.',
      kinesthetic: 'Act out what it means when we say "the flowers danced in the breeze" or "the car complained as it started" - you're physically demonstrating personification.'
    }
  }
];

// Component for testing AI Assistant
const AIAssistantTest: React.FC = () => {
  const { 
    hint, 
    explanation, 
    recommendations,
    loading, 
    error, 
    getHint, 
    getExplanation, 
    getRecommendations,
    clearHint,
    clearExplanation,
    clearError
  } = useAI();
  
  const { user } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [hintIndex, setHintIndex] = useState<number>(0);
  const [customSubject, setCustomSubject] = useState<string>('');
  const [aiIntegrationEnabled, setAiIntegrationEnabled] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  // Check if OpenAI integration is enabled in the backend
  useEffect(() => {
    const checkAiIntegration = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/ai/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAiIntegrationEnabled(response.data.enabled);
        addTestResult(`AI Integration Status: ${response.data.enabled ? 'Enabled' : 'Disabled'}`);
      } catch (err) {
        setAiIntegrationEnabled(false);
        addTestResult('AI Integration Status: Unable to determine (API endpoint may not exist yet)');
      }
    };
    
    checkAiIntegration();
  }, []);
  
  // Add a test result message
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Request a hint
  const handleGetHint = () => {
    const question = MOCK_QUESTIONS[selectedQuestion];
    addTestResult(`Requesting hint for question: "${question.text.substring(0, 30)}..."`);
    getHint(question._id, hintIndex);
  };
  
  // Request an explanation
  const handleGetExplanation = () => {
    const question = MOCK_QUESTIONS[selectedQuestion];
    addTestResult(`Requesting explanation for question: "${question.text.substring(0, 30)}..."`);
    getExplanation(question._id);
  };
  
  // Request recommendations
  const handleGetRecommendations = () => {
    addTestResult(`Requesting recommendations${customSubject ? ` for ${customSubject}` : ''}`);
    getRecommendations(customSubject || undefined);
  };
  
  // Handle next hint
  const handleNextHint = () => {
    if (hintIndex < MOCK_QUESTIONS[selectedQuestion].hints.length - 1) {
      setHintIndex(hintIndex + 1);
      addTestResult(`Advancing to hint #${hintIndex + 2}`);
    }
  };
  
  // Handle previous hint
  const handlePrevHint = () => {
    if (hintIndex > 0) {
      setHintIndex(hintIndex - 1);
      addTestResult(`Going back to hint #${hintIndex}`);
    }
  };
  
  // Switch to the next question
  const handleNextQuestion = () => {
    setSelectedQuestion((selectedQuestion + 1) % MOCK_QUESTIONS.length);
    setHintIndex(0);
    clearHint();
    clearExplanation();
    addTestResult(`Switched to question #${selectedQuestion + 2}`);
  };
  
  // Clear all results
  const handleClearResults = () => {
    clearHint();
    clearExplanation();
    clearError();
    addTestResult('Cleared all AI assistant results');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Assistant Test</h1>
      
      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        {user ? (
          <div>
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Learning Style:</span> {user.learningStyle}</p>
            <p className="mt-2 text-xs text-gray-500">
              The learning style affects how explanations are tailored to the user
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Not logged in</p>
        )}
      </div>
      
      {/* AI Integration Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">AI Integration Status</h2>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${aiIntegrationEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p>
            {aiIntegrationEnabled 
              ? 'Advanced AI integration is enabled' 
              : 'Using basic static responses (OpenAI integration not detected)'}
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          When AI integration is enabled, responses are dynamic and context-aware
        </p>
      </div>
      
      {/* Question Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Question</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="font-medium mb-2">{MOCK_QUESTIONS[selectedQuestion].text}</p>
          <div className="ml-4">
            {MOCK_QUESTIONS[selectedQuestion].options.map((option, index) => (
              <p key={index} className="mb-1">
                {String.fromCharCode(65 + index)}. {option}
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Subject: {MOCK_QUESTIONS[selectedQuestion].subject}, 
            Difficulty: {MOCK_QUESTIONS[selectedQuestion].difficulty}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={handleGetHint}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
              disabled={loading}
            >
              Get Hint
            </button>
            <button
              onClick={handleGetExplanation}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              Get Explanation
            </button>
          </div>
          <button
            onClick={handleNextQuestion}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Next Question
          </button>
        </div>
      </div>
      
      {/* AI Assistant Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hint Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hint</h2>
            <div>
              <button
                onClick={handlePrevHint}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 mr-1 text-sm"
                disabled={hintIndex === 0}
              >
                &larr;
              </button>
              <span className="mx-2 text-sm">
                {hintIndex + 1}/{MOCK_QUESTIONS[selectedQuestion].hints.length}
              </span>
              <button
                onClick={handleNextHint}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 text-sm"
                disabled={hintIndex >= MOCK_QUESTIONS[selectedQuestion].hints.length - 1}
              >
                &rarr;
              </button>
            </div>
          </div>
          
          {loading && !hint ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : hint ? (
            <div className="bg-indigo-50 p-4 rounded-md">
              <p>{hint}</p>
            </div>
          ) : (
            <p className="text-gray-500 h-32 flex items-center justify-center">
              No hint requested yet
            </p>
          )}
        </div>
        
        {/* Explanation Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Explanation</h2>
          
          {loading && !explanation ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : explanation ? (
            <div className="bg-green-50 p-4 rounded-md">
              <p>{explanation}</p>
            </div>
          ) : (
            <p className="text-gray-500 h-32 flex items-center justify-center">
              No explanation requested yet
            </p>
          )}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Study Recommendations</h2>
        
        <div className="flex items-end gap-4 mb-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject (optional)
            </label>
            <input
              type="text"
              id="subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              placeholder="e.g., Math, English, Science"
            />
          </div>
          
          <button
            onClick={handleGetRecommendations}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            disabled={loading}
          >
            Get Recommendations
          </button>
        </div>
        
        {loading && recommendations.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="bg-purple-50 p-4 rounded-md">
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 h-32 flex items-center justify-center">
            No recommendations requested yet
          </p>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Test Results Log */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results Log</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClearResults}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Clear Results
            </button>
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Clear Log
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {testResults.length > 0 ? (
            <ul className="space-y-1">
              {testResults.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No test activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTest; 