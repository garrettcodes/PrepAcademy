import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import Question from '../../components/question/Question';

interface DiagnosticQuestion {
  _id: string;
  text: string;
  options: string[];
  subject: string;
  format: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  format: string;
  subject: string;
}

const DiagnosticTest: React.FC = () => {
  const navigate = useNavigate();
  const { submitDiagnosticTest, loading, error } = useStudy();
  
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [formatScores, setFormatScores] = useState({
    text: { correct: 0, total: 0 },
    diagram: { correct: 0, total: 0 },
    audio: { correct: 0, total: 0 }
  });

  // Fetch diagnostic questions on mount
  useEffect(() => {
    const fetchDiagnosticQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/diagnostic/questions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setQuestions(data);
        } else {
          console.error('Failed to fetch diagnostic questions:', data.message);
        }
      } catch (error) {
        console.error('Error fetching diagnostic questions:', error);
      }
    };

    fetchDiagnosticQuestions();
  }, []);

  // Handler for when a question is answered
  const handleAnswer = (questionId: string, selectedAnswer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Add to answers
    const newAnswer = {
      questionId,
      selectedAnswer,
      format: currentQuestion.format,
      subject: currentQuestion.subject
    };
    
    setAnswers([...answers, newAnswer]);
    
    // Move to next question or complete test
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  // Handle test submission
  const handleSubmit = async () => {
    // Analyze answers to determine learning style
    // This is a simplified approach - the actual algorithm would run server-side
    let learningStyle = 'visual'; // default
    
    // Mock correct answers for demo (this would be checked server-side in reality)
    const correctAnswers = questions.map((q) => ({ 
      id: q._id, 
      format: q.format 
    }));
    
    // Increment question counts and correct answers by format
    const newFormatScores = { ...formatScores };
    
    answers.forEach((answer, index) => {
      const format = answer.format;
      newFormatScores[format as keyof typeof newFormatScores].total += 1;
      
      // Simulate checking if answer is correct (randomly for demo)
      // In real implementation, this would be done on the server
      const isCorrect = Math.random() > 0.5;
      if (isCorrect) {
        newFormatScores[format as keyof typeof newFormatScores].correct += 1;
      }
    });
    
    setFormatScores(newFormatScores);
    
    // Determine learning style based on best performance
    const formatEffectiveness: Record<string, number> = {};
    
    Object.entries(newFormatScores).forEach(([format, { correct, total }]) => {
      formatEffectiveness[format] = total > 0 ? (correct / total) * 100 : 0;
    });
    
    // Find format with highest effectiveness
    const bestFormat = Object.entries(formatEffectiveness)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Map format to learning style
    switch (bestFormat) {
      case 'text':
        learningStyle = 'reading/writing';
        break;
      case 'diagram':
        learningStyle = 'visual';
        break;
      case 'audio':
        learningStyle = 'auditory';
        break;
      default:
        learningStyle = 'visual'; // Default
    }
    
    // Submit diagnostic test results
    await submitDiagnosticTest(answers, learningStyle);
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  // Loading state
  if (loading || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic test...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>Error: {error}</p>
          <button 
            className="mt-2 bg-red-100 text-red-800 px-4 py-2 rounded"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Test completed state
  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Diagnostic Test Complete!</h2>
          <p className="mb-4">
            Thank you for completing the diagnostic test. We'll analyze your answers to create a personalized study plan.
          </p>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'View Results'}
          </button>
        </div>
      </div>
    );
  }

  // Current question display
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Diagnostic Test</h1>
        <p className="text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {currentQuestion && (
        <Question
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};

export default DiagnosticTest; 