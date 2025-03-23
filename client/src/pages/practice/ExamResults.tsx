import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PracticeContext } from '../../context/PracticeContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, PolarArea, Radar } from 'react-chartjs-2';

// UI components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement);

// Define types for question types breakdown
interface QuestionTypeData {
  type: string;
  correct: number;
  total: number;
  percentage: number;
}

const ExamResults: React.FC = () => {
  const { examResult, loading, error, fetchExamDetails } = useContext(PracticeContext)!;
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeData[]>([]);
  const [sectionPerformance, setSectionPerformance] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Get colors for chart display
  const chartColors = {
    backgrounds: [
      'rgba(54, 162, 235, 0.6)',  // Blue
      'rgba(255, 99, 132, 0.6)',  // Red
      'rgba(75, 192, 192, 0.6)',  // Teal
      'rgba(255, 206, 86, 0.6)',  // Yellow
      'rgba(153, 102, 255, 0.6)', // Purple
      'rgba(255, 159, 64, 0.6)',  // Orange
    ],
    borders: [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ]
  };

  useEffect(() => {
    if (id) {
      fetchExamDetails(id);
    }
  }, [id, fetchExamDetails]);

  useEffect(() => {
    if (examResult && (examResult as any).detailedBreakdown) {
      // Process question type breakdown
      const detailedBreakdown = (examResult as any).detailedBreakdown;
      
      if (detailedBreakdown.questionTypes) {
        const types = Object.entries(detailedBreakdown.questionTypes).map(([type, data]: [string, any]) => ({
          type,
          correct: data.correct,
          total: data.total,
          percentage: Math.round((data.correct / data.total) * 100)
        }));
        setQuestionTypes(types);
      }

      // Set section performance
      if (examResult.subjectScores) {
        setSectionPerformance(examResult.subjectScores);
      }
    }
  }, [examResult]);

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

  if (!examResult) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Results Available</h2>
        <p className="text-gray-600 mb-4">
          Result details are not available. Return to the exams page to view other exams.
        </p>
        <Button onClick={() => navigate('/exams')}>Go Back to Exams</Button>
      </div>
    );
  }

  // Prepare data for charts
  const subjectData = {
    labels: Object.keys(sectionPerformance),
    datasets: [
      {
        label: 'Score (%)',
        data: Object.values(sectionPerformance),
        backgroundColor: chartColors.backgrounds.slice(0, Object.keys(sectionPerformance).length),
        borderColor: chartColors.borders.slice(0, Object.keys(sectionPerformance).length),
        borderWidth: 1,
      },
    ],
  };

  const questionTypeData = {
    labels: questionTypes.map(item => item.type),
    datasets: [
      {
        label: 'Score (%)',
        data: questionTypes.map(item => item.percentage),
        backgroundColor: chartColors.backgrounds.slice(0, questionTypes.length),
        borderColor: chartColors.borders.slice(0, questionTypes.length),
        borderWidth: 1,
      },
    ],
  };

  // Radar chart data for question types
  const radarData = {
    labels: questionTypes.map(item => item.type),
    datasets: [
      {
        label: 'Your Performance',
        data: questionTypes.map(item => item.percentage),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Target Performance',
        data: questionTypes.map(() => 80), // Target score of 80%
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Performance by Subject',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)'
        }
      }
    }
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <StatusBadge variant="primary" className="text-sm">
          {examResult?.examType || 'Practice Test'}
        </StatusBadge>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 border-t-4 border-t-blue-500">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Results Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{examResult.score}%</div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{examResult.correctCount}</div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">{examResult.totalQuestions}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance Overview</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-60">
                  <Pie 
                    data={{
                      labels: ['Correct', 'Incorrect'],
                      datasets: [
                        {
                          data: [examResult.correctCount, examResult.totalQuestions - examResult.correctCount],
                          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                          borderWidth: 1,
                        },
                      ],
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance Rating</h3>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-60">
                  <div className="text-center">
                    <div className="mb-2">
                      <StatusBadge 
                        variant={
                          examResult.score >= 90 ? 'success' : 
                          examResult.score >= 70 ? 'warning' : 
                          'danger'
                        }
                        className="text-xl py-2 px-4"
                      >
                        {examResult.score >= 90 ? 'Excellent' : 
                         examResult.score >= 80 ? 'Very Good' : 
                         examResult.score >= 70 ? 'Good' : 
                         examResult.score >= 60 ? 'Fair' : 
                         'Needs Improvement'}
                      </StatusBadge>
                    </div>
                    <p className="text-gray-600 mt-4">
                      {examResult.score >= 90 ? 'Outstanding performance! Keep up the excellent work.' : 
                       examResult.score >= 80 ? 'Great job! You have a strong understanding of the material.' : 
                       examResult.score >= 70 ? 'Good work. With a bit more practice, you can improve your score.' : 
                       examResult.score >= 60 ? 'You\'re on the right track. Focus on improving your weak areas.' : 
                       'Focus on reviewing the concepts and practice more regularly.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subject Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Performance by Subject</h2>
            <div className="h-80">
              <Bar data={subjectData} options={barOptions} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Breakdown</h2>
            {Object.keys(sectionPerformance).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-center">Score</th>
                      <th className="px-4 py-2 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sectionPerformance).map(([subject, score]) => (
                      <tr key={subject} className="border-b">
                        <td className="px-4 py-3">{subject}</td>
                        <td className="px-4 py-3 text-center">{score}%</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge 
                            variant={
                              score >= 80 ? 'success' : 
                              score >= 60 ? 'warning' : 
                              'danger'
                            }
                          >
                            {score >= 80 ? 'Strong' : score >= 60 ? 'Average' : 'Weak'}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No subject data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Question Type Performance */}
      {questionTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Performance by Question Type</h2>
              <div className="h-80">
                <PolarArea data={questionTypeData} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>
              <div className="h-80">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h2>
          
          <div className="space-y-4">
            {Object.entries(sectionPerformance)
              .filter(([_, score]) => score < 70)
              .map(([subject, score]) => (
                <div key={subject} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h3 className="font-semibold text-gray-800">{subject} ({score}%)</h3>
                  <p className="text-gray-600 mt-1">
                    Focus on improving your knowledge in {subject}. Consider:
                    <ul className="list-disc ml-5 mt-2">
                      <li>Reviewing core concepts</li>
                      <li>Practicing more questions in this area</li>
                      <li>Scheduling focused study sessions</li>
                    </ul>
                  </p>
                </div>
              ))}
              
            {questionTypes
              .filter(type => type.percentage < 70)
              .map(type => (
                <div key={type.type} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h3 className="font-semibold text-gray-800">{type.type} ({type.percentage}%)</h3>
                  <p className="text-gray-600 mt-1">
                    Work on improving your {type.type.toLowerCase()} question skills.
                  </p>
                </div>
              ))}
              
            {Object.entries(sectionPerformance).every(([_, score]) => score >= 70) && 
             questionTypes.every(type => type.percentage >= 70) && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h3 className="font-semibold text-gray-800">Great Work!</h3>
                <p className="text-gray-600 mt-1">
                  You're performing well across all areas. Continue practicing to maintain and improve your skills.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
      </div>
    </div>
  );
};

export default ExamResults; 