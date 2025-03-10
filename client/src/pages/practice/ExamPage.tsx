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
  const [timerInitialized, setTimerInitialized] = useState(false);

  // Get timer key for this specific exam
  const getTimerKey = useCallback(() => {
    return `exam_timer_${id}`;
  }, [id]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save timer state to localStorage
  const saveTimerState = useCallback((timeLeft: number) => {
    if (!id) return;
    
    // Create a comprehensive record of current exam state
    const updatedAnswers = [...answers];
    
    // If there's a selected answer for the current question, make sure it's included
    if (selectedAnswer && currentExam?.questions[currentQuestionIndex]) {
      const currentQuestionId = currentExam.questions[currentQuestionIndex]._id;
      const existingAnswerIndex = updatedAnswers.findIndex(
        a => a.questionId === currentQuestionId
      );
      
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          selectedAnswer,
          timeSpent,
        };
      } else {
        // Add new answer
        updatedAnswers.push({
          questionId: currentQuestionId,
          selectedAnswer,
          timeSpent,
        });
      }
    }
    
    // Save the current time and remaining seconds with comprehensive state
    const timerData = {
      timeRemaining: timeLeft,
      timestamp: new Date().getTime(),
      examId: id,
      answers: updatedAnswers,
      currentQuestionIndex: currentQuestionIndex,
      examTitle: currentExam?.title || '',
    };
    
    try {
      localStorage.setItem(getTimerKey(), JSON.stringify(timerData));
      
      // Also save a backup in session storage in case local storage fails
      sessionStorage.setItem(getTimerKey(), JSON.stringify(timerData));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, [id, answers, currentQuestionIndex, selectedAnswer, timeSpent, currentExam, getTimerKey]);

  // Initialize exam
  useEffect(() => {
    if (id) {
      fetchExamById(id);
      setExamStartTime(new Date());
    }
  }, [id, fetchExamById]);

  // Initialize timer when exam loads or retrieve from localStorage
  useEffect(() => {
    if (!currentExam || timerInitialized) return;
    
    try {
      // Check if timer exists in localStorage or sessionStorage
      let savedTimerJSON = localStorage.getItem(getTimerKey());
      
      // If not in localStorage, try sessionStorage as backup
      if (!savedTimerJSON) {
        savedTimerJSON = sessionStorage.getItem(getTimerKey());
      }
      
      if (savedTimerJSON) {
        const savedTimer = JSON.parse(savedTimerJSON);
        
        // Verify this is the right exam
        if (savedTimer.examId === id) {
          // Calculate elapsed time since last save
          const elapsedSeconds = Math.floor((new Date().getTime() - savedTimer.timestamp) / 1000);
          let adjustedTimeRemaining = Math.max(savedTimer.timeRemaining - elapsedSeconds, 0);
          
          // If timer has expired while away, handle auto-submission
          if (adjustedTimeRemaining === 0) {
            console.log('Timer expired while away, auto-submitting exam');
            
            // Retrieve saved answers and submit
            const savedAnswers = savedTimer.answers || [];
            
            // Clear timer storage
            localStorage.removeItem(getTimerKey());
            sessionStorage.removeItem(getTimerKey());
            
            // Submit the exam with saved answers
            submitExam(id!, savedAnswers, new Date());
            setTimerActive(false);
            navigate('/exams/results'); // Redirect to results page
            return;
          }

          // Set state from saved timer data
          setTimeRemaining(adjustedTimeRemaining);
          
          // Restore answers if available
          if (savedTimer.answers && savedTimer.answers.length > 0) {
            setAnswers(savedTimer.answers);
          }
          
          // Restore current question index if valid
          if (savedTimer.currentQuestionIndex !== undefined && 
              savedTimer.currentQuestionIndex >= 0 && 
              savedTimer.currentQuestionIndex < currentExam.questions.length) {
            setCurrentQuestionIndex(savedTimer.currentQuestionIndex);
          }
          
          // Check if there's a selected answer for the current question
          if (savedTimer.answers && savedTimer.currentQuestionIndex !== undefined) {
            const currentQuestionId = currentExam.questions[savedTimer.currentQuestionIndex]._id;
            const savedAnswer = savedTimer.answers.find(a => a.questionId === currentQuestionId);
            
            if (savedAnswer) {
              setSelectedAnswer(savedAnswer.selectedAnswer);
            }
          }
        } else {
          // Different exam, set new timer
          console.log('Starting new timer for different exam');
          setTimeRemaining(currentExam.duration * 60);
        }
      } else {
        // No saved timer, set new timer
        console.log('Starting new timer');
        setTimeRemaining(currentExam.duration * 60);
      }
      
      setTimerActive(true);
      setTimerInitialized(true);
    } catch (error) {
      console.error('Error initializing timer:', error);
      // Fallback to setting a new timer
      setTimeRemaining(currentExam.duration * 60);
      setTimerActive(true);
      setTimerInitialized(true);
    }
  }, [currentExam, id, getTimerKey, timerInitialized, submitExam, navigate]);

  // Timer countdown effect with localStorage persistence
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeRemaining > 0) {
      // Save timer state initially
      saveTimerState(timeRemaining);
      
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
    
          // Save timer state every 5 seconds for better reliability
          if (newTime % 5 === 0 || newTime <= 60) {
            saveTimerState(newTime);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      // Auto-submit when time runs out
      setTimerActive(false); // Prevent multiple submissions
      
      // Add a small delay to ensure state is updated before submission
      setTimeout(() => {
        // Get the latest saved answers from localStorage as a backup
        const savedTimerJSON = localStorage.getItem(getTimerKey());
        let finalAnswers = [...answers];
        
        if (savedTimerJSON) {
          const savedTimer = JSON.parse(savedTimerJSON);
          if (savedTimer.answers && savedTimer.answers.length > 0) {
            // Use saved answers if they exist and have more items than current answers
            if (savedTimer.answers.length > finalAnswers.length) {
              finalAnswers = savedTimer.answers;
            }
          }
        }
        
        // If the current question has a selected answer but isn't in answers yet, add it
        if (selectedAnswer && currentExam?.questions[currentQuestionIndex]) {
          const currentQuestionId = currentExam.questions[currentQuestionIndex]._id;
          const answerExists = finalAnswers.some(a => a.questionId === currentQuestionId);
          
          if (!answerExists) {
            finalAnswers.push({
              questionId: currentQuestionId,
              selectedAnswer,
              timeSpent,
            });
          }
        }
        
        // Submit the exam
        console.log('Auto-submitting exam due to timer expiration');
        submitExam(id!, finalAnswers, new Date());
        
        // Clear timer data from localStorage
        localStorage.removeItem(getTimerKey());
        sessionStorage.removeItem(getTimerKey());
        
        // Navigate to results page
        navigate('/exams/results');
      }, 500);
    }
    
    // Event listeners for page visibility changes and beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && timerActive && timeRemaining > 0) {
        // Save timer state when page becomes hidden (tab switch, minimize)
        saveTimerState(timeRemaining);
      } else if (document.visibilityState === 'visible' && timerActive) {
        // When page becomes visible again, check if timer needs adjustment
        const savedTimerJSON = localStorage.getItem(getTimerKey());
        if (savedTimerJSON) {
          const savedTimer = JSON.parse(savedTimerJSON);
          const elapsedSeconds = Math.floor((new Date().getTime() - savedTimer.timestamp) / 1000);
          const adjustedTimeRemaining = Math.max(savedTimer.timeRemaining - elapsedSeconds, 0);
          
          // Only update if there's a significant difference (more than 2 seconds)
          if (Math.abs(adjustedTimeRemaining - timeRemaining) > 2) {
            setTimeRemaining(adjustedTimeRemaining);
            
            // If timer expired while away, trigger auto-submission
            if (adjustedTimeRemaining === 0) {
              setTimerActive(false);
              setTimeout(() => {
                submitExam(id!, savedTimer.answers || [], new Date());
                localStorage.removeItem(getTimerKey());
                sessionStorage.removeItem(getTimerKey());
                navigate('/exams/results');
              }, 500);
            }
          }
        }
      }
    };
    
    const handleBeforeUnload = () => {
      if (timerActive && timeRemaining > 0) {
        saveTimerState(timeRemaining);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerActive, timeRemaining, saveTimerState, handleSubmitExam, getTimerKey, id, submitExam, navigate, answers, selectedAnswer, currentExam, currentQuestionIndex, timeSpent]);

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
    
    // Update saved timer data when an answer is selected
    if (id) {
      const updatedAnswers = [...answers];
      
      // Check if we need to update an existing answer or add a new one
      const existingAnswerIndex = updatedAnswers.findIndex(
        a => a.questionId === currentExam.questions[currentQuestionIndex]._id
      );
      
      if (existingAnswerIndex >= 0) {
        updatedAnswers[existingAnswerIndex].selectedAnswer = answer;
      }
      
      // Update the saved timer data with the latest answer
      saveTimerState(timeRemaining);
    }
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
    let finalAnswers = [...answers];
    
    if (selectedAnswer && currentQuestionIndex < currentExam.questions.length) {
      const currentQuestion = currentExam.questions[currentQuestionIndex];
      const existingAnswerIndex = finalAnswers.findIndex(a => a.questionId === currentQuestion._id);
      
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        finalAnswers[existingAnswerIndex].selectedAnswer = selectedAnswer;
        finalAnswers[existingAnswerIndex].timeSpent = timeSpent;
      } else {
        // Add new answer
        finalAnswers.push({
          questionId: currentQuestion._id,
          selectedAnswer,
          timeSpent,
        });
      }
    }
    
    // Submit exam
    submitExam(id, finalAnswers, new Date());
    
    // Clear timer data from localStorage
    localStorage.removeItem(getTimerKey());
    sessionStorage.removeItem(getTimerKey());
    
    // Navigate to results page
    navigate('/exams/results');
  }, [currentExam, id, answers, currentQuestionIndex, selectedAnswer, timeSpent, submitExam, getTimerKey, navigate]);

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