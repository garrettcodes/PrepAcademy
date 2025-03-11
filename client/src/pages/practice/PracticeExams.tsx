import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PracticeContext } from '../../context/PracticeContext';
import PremiumFeatureGuard from '../../components/subscription/PremiumFeatureGuard';

// UI components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const PracticeExams: React.FC = () => {
  const { exams, loading, error, fetchExams, examResult, resetExamResult } = useContext(PracticeContext)!;

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Premium content fallback
  const premiumFallback = (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Practice Exams</h1>
      
      <Card className="text-center py-12">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full-Length Practice Exams - Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            Access complete SAT/ACT practice exams that simulate the real testing experience. 
            Our premium exams include detailed scoring and performance analytics to help you identify areas for improvement.
          </p>
          <Link 
            to="/pricing" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition-colors"
          >
            View Subscription Plans
          </Link>
        </div>
      </Card>
    </div>
  );

  return (
    <PremiumFeatureGuard fallback={premiumFallback}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Practice Exams</h1>
        
        {examResult && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-800">Exam Result</h2>
                <Button variant="text" onClick={resetExamResult}>
                  Dismiss
                </Button>
              </div>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-center text-green-700 mb-2">
                  {examResult.score}%
                </div>
                <div className="text-sm text-center text-gray-600">
                  {examResult.correctCount} out of {examResult.totalQuestions} correct
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-md font-semibold text-gray-700">Subject Performance:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(examResult.subjectScores).map(([subject, score]) => (
                    <div key={subject} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                      <span className="text-gray-700">{subject}</span>
                      <Badge variant={
                        score >= 80 ? 'success' : 
                        score >= 60 ? 'warning' : 
                        'danger'
                      }>
                        {score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exams && exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => (
              <Card key={exam._id} className="h-full">
                <div className="p-4 flex flex-col h-full">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{exam.title}</h2>
                    <p className="text-gray-600 text-sm mb-2">{exam.description}</p>
                    <div className="flex items-center space-x-4">
                      <Badge variant={
                        exam.difficulty === 'easy' ? 'success' : 
                        exam.difficulty === 'hard' ? 'danger' : 
                        exam.difficulty === 'adaptive' ? 'primary' : 
                        'warning'
                      }>
                        {exam.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">{exam.duration} minutes</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Link to={`/exams/${exam._id}`}>
                      <Button className="w-full">Start Exam</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">No Exams Available</h2>
            <p className="text-gray-600 mb-4">
              There are currently no practice exams available. Please check back later or contact your instructor.
            </p>
          </Card>
        )}
      </div>
    </PremiumFeatureGuard>
  );
};

export default PracticeExams; 