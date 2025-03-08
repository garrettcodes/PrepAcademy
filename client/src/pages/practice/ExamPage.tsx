import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PracticeContext } from '../../context/PracticeContext';
import { API_URL } from '../../config';
import { QuestionCard } from '../../components/question/QuestionCard';

// UI components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface Answer {
  questionId: string;
  selectedAnswer: string;
  timeSpent: number;
}

const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentExam,
    loading,
    error,
    fetchExamById,
    submitExam,
    getNextAdaptiveQuestion,
  } = useContext(PracticeContext)!;

  // State for the current exam
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize exam
  useEffect(() => {
    if (id) {
      fetchExamById(id);
      setExamStartTime(new Date());
    }
  }, [id, fetchExamById]);

  // Initialize timer when exam loads
  useEffect(() => {
    if (currentExam) {
      // Set timer to the exam duration in minutes, converted to seconds
      setTimeRemaining(currentExam.duration * 60);
      setTimerActive(true);
    }
  }, [currentExam]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      handleSubmitExam();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);

  // Track time spent on current question
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentExam) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentQuestionIndex, currentExam]);

  // Function to handle selecting an answer
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Function to get the next question with adaptive difficulty
  const handleNextQuestion = async () => {
    if (!currentExam || !id || currentQuestionIndex >= currentExam.questions.length - 1) {
      handleSubmitExam();
      return;
    }

    // Store the current answer
    const currentQuestion = currentExam.questions[currentQuestionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion._id,
      selectedAnswer,
      timeSpent,
    };

    // Add to answers array
    setAnswers((prev) => [...prev, newAnswer]);

    // If it's an adaptive exam, fetch the next question based on performance
    if (currentExam.difficulty === 'adaptive') {
      try {
        // Check if the selected answer is correct
        const isCorrect = await checkAnswer(currentQuestion._id, selectedAnswer);
        
        // Get next question with adaptive difficulty
        await getNextAdaptiveQuestion(id, currentQuestion._id, isCorrect);
      } catch (error) {
        console.error('Error getting next adaptive question:', error);
      }
    } else {
      // For non-adaptive exams, just move to the next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }

    // Reset for next question
    setSelectedAnswer('');
    setTimeSpent(0);
  };

  // Function to check if an answer is correct (for adaptive exams)
  const checkAnswer = async (questionId: string, selectedAnswer: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/questions/answer`, {
        questionId,
        selectedAnswer,
      });
      return response.data.isCorrect;
    } catch (error) {
      console.error('Error checking answer:', error);
      return false;
    }
  };

  // Function to submit the entire exam
  const handleSubmitExam = useCallback(() => {
    if (!currentExam || !id) return;
    
    // Add the current question's answer if not already added
    if (selectedAnswer && currentQuestionIndex < currentExam.questions.length) {
      const currentQuestion = currentExam.questions[currentQuestionIndex];
      const newAnswer: Answer = {
        questionId: currentQuestion._id,
        selectedAnswer,
        timeSpent,
      };
      
      // Submit all answers
      submitExam(id, [...answers, newAnswer], new Date());
    } else {
      // Submit existing answers
      submitExam(id, answers, new Date());
    }
    
    // Stop the timer
    setTimerActive(false);
    
    // Navigate to results page
    navigate('/exams');
  }, [currentExam, id, selectedAnswer, currentQuestionIndex, timeSpent, answers, submitExam, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/exams')}>
          Go Back to Exams
        </Button>
      </div>
    );
  }

  if (!currentExam) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Exam Not Found</h2>
        <Button onClick={() => navigate('/exams')}>Go Back to Exams</Button>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{currentExam.title}</h1>
          <p className="text-gray-600">{currentExam.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-700 font-medium">Progress:</span>
            <span>
              {currentQuestionIndex + 1} of {currentExam.questions.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Time Remaining:</span>
            <Badge variant={timeRemaining < 300 ? 'danger' : timeRemaining < 600 ? 'warning' : 'success'}>
              {formatTime(timeRemaining)}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-1">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              showHints={false}
              showFeedback={false}
            />
          ) : (
            <p className="text-center p-8 text-gray-700">No questions available</p>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (window.confirm('Are you sure you want to submit this exam?')) {
              handleSubmitExam();
            }
          }}
        >
          Submit Exam
        </Button>
        
        <Button
          disabled={!selectedAnswer}
          onClick={handleNextQuestion}
        >
          {currentQuestionIndex >= currentExam.questions.length - 1 ? 'Finish Exam' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
};

export default ExamPage; 