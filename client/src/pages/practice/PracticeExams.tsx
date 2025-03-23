import React, { useEffect, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePractice } from '../../context/PracticeContext';
import PremiumFeatureGuard from '../../components/subscription/PremiumFeatureGuard';

// UI Components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

const PracticeExams: React.FC = () => {
  const { exams, loading, error, fetchExams, examResult, resetExamResult } = usePractice();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  if (loading) {
    return <div className="text-center p-8">Loading exams...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Practice Exams</h1>
      
      {examResult && (
        <Card className="mb-8 bg-blue-50 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Recent Exam Result</h3>
              <p className="text-blue-700 mb-4">
                You scored <span className="font-bold">{examResult.score}%</span> on {examResult.examTitle}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <StatusBadge variant={getScoreBadgeVariant(examResult.score)}>
                  Overall Score: {examResult.score}%
                </StatusBadge>
                
                {examResult.strongestSubject && (
                  <StatusBadge variant="success">
                    Strongest: {examResult.strongestSubject}
                  </StatusBadge>
                )}
                
                {examResult.weakestSubject && (
                  <StatusBadge variant="warning">
                    Needs Work: {examResult.weakestSubject}
                  </StatusBadge>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-3">
              <Button onClick={() => navigate(`/exams/results/${examResult.examId || examResult._id}`)}>
                View Full Results
              </Button>
              <Button variant="outline" onClick={resetExamResult}>
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <Card key={exam._id} className="h-full">
            <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
            <p className="text-gray-600 mb-4">{exam.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge variant={
                exam.difficulty === 'easy' ? 'success' :
                exam.difficulty === 'medium' ? 'warning' :
                'danger'
              }>
                {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
              </StatusBadge>
              
              <StatusBadge variant="primary">
                {exam.duration} min
              </StatusBadge>
            </div>
            
            <div className="mt-auto">
              <Link to={`/exams/${exam._id}`}>
                <Button className="w-full">Start Exam</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PracticeExams; 