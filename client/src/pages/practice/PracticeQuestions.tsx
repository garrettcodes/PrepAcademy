import React, { useState, useEffect } from 'react';
import { usePractice } from '../../context/PracticeContext';
import { useQuestion } from '../../context/QuestionContext';
import Question from '../../components/question/Question';
import StudyTimer from '../../components/ui/StudyTimer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import BadgeEarnedNotification from '../../components/ui/BadgeEarnedNotification';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const PracticeQuestions: React.FC = () => {
  const { fetchQuestions, questions, loading, error } = usePractice();
  const { submitAnswer: submitQuestionAnswer } = useQuestion();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  
  // Filter state
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [format, setFormat] = useState('all');
  const [limit, setLimit] = useState(10);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    similarQuestions?: any[];
  } | null>(null);
  
  // Badge notification state
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Load initial questions
  useEffect(() => {
    handleSearch();
  }, []);

  // Function to handle search with filters
  const handleSearch = async () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowFeedback(false);
    setFeedback(null);
    
    await fetchQuestions({
      subject: subject !== 'all' ? subject : undefined,
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      format: format !== 'all' ? format : undefined,
      limit,
    });
  };

  // Handle answer submission
  const handleAnswer = async (selectedOption: string) => {
    if (loading || !questions[currentQuestionIndex]) return;
  
    setLoadingAnswer(true);
    
    try {
      // Update user answers
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentQuestionIndex] = selectedOption;
      setUserAnswers(updatedAnswers);
      
      // Get the elapsed time if timer is running
      const timeSpent = document.getElementById('study-timer')?.dataset.elapsed 
        ? parseInt(document.getElementById('study-timer')?.dataset.elapsed || '0')
        : 0;
      
      // Submit answer to backend
      const questionId = questions[currentQuestionIndex]._id;
      const response = await submitQuestionAnswer(questionId, selectedOption, timeSpent);
      
      // Show feedback
      setFeedback({
        isCorrect: response.isCorrect,
        explanation: response.explanation,
        similarQuestions: response.similarQuestions,
      });
      setShowFeedback(true);
      
      // Check if badges were earned
      if (response.earnedBadges && response.earnedBadges.length > 0) {
        setEarnedBadges(response.earnedBadges);
        setCurrentBadgeIndex(0);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Navigation functions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowFeedback(false);
    }
  };
  
  // Handle badge notification close
  const handleBadgeClose = () => {
    if (currentBadgeIndex < earnedBadges.length - 1) {
      // Show next badge
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      // No more badges, clear the list
      setEarnedBadges([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Practice Questions</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[
                { value: 'all', label: 'All Subjects' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Science', label: 'Science' },
                { value: 'English', label: 'English' },
                { value: 'History', label: 'History' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={[
                { value: 'all', label: 'All Difficulties' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={[
                { value: 'all', label: 'All Formats' },
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True/False' },
                { value: 'fill-in-blank', label: 'Fill in the Blank' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <Select
              value={limit.toString()}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              options={[
                { value: '5', label: '5 Questions' },
                { value: '10', label: '10 Questions' },
                { value: '15', label: '15 Questions' },
                { value: '20', label: '20 Questions' },
              ]}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search Questions'}
          </Button>
        </div>
      </Card>
      
      {/* Study timer */}
      <div className="mb-6">
        <StudyTimer 
          subject={subject === 'all' ? 'General' : subject} 
          subtopic="Practice Questions"
        />
      </div>
      
      {/* Questions */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}
      
      {!loading && questions.length === 0 && !error && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6">
          No questions found. Try different filters.
        </div>
      )}
      
      {questions.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
          
          <Card>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading questions...</p>
              </div>
            ) : (
              <Question
                question={questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                userAnswer={userAnswers[currentQuestionIndex]}
                showFeedback={showFeedback}
                feedback={feedback}
                loading={loadingAnswer}
              />
            )}
          </Card>
        </div>
      )}
      
      {/* Badge notification */}
      {earnedBadges.length > 0 && (
        <BadgeEarnedNotification 
          badge={earnedBadges[currentBadgeIndex]} 
          onClose={handleBadgeClose} 
        />
      )}
    </div>
  );
};

export default PracticeQuestions; 