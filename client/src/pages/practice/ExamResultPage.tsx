import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeContext } from '../../context/PracticeContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ChartOptions 
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';

// UI components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement
);

const ExamResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { examResult, resetExamResult } = useContext(PracticeContext)!;
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'questions'>('overview');

  // If no exam result, redirect to practice exams page
  if (!examResult) {
    navigate('/exams');
    return null;
  }

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Convert subject scores to chart data for Bar chart
  const subjectScoresData = {
    labels: Object.keys(examResult.subjectScores),
    datasets: [
      {
        label: 'Score (%)',
        data: Object.values(examResult.subjectScores),
        backgroundColor: Object.keys(examResult.subjectScores).map(subject => {
          const score = examResult.subjectScores[subject];
          return score >= 80 ? 'rgba(34, 197, 94, 0.7)' : 
                 score >= 60 ? 'rgba(234, 179, 8, 0.7)' : 
                 'rgba(239, 68, 68, 0.7)';
        }),
        borderColor: Object.keys(examResult.subjectScores).map(subject => {
          const score = examResult.subjectScores[subject];
          return score >= 80 ? 'rgb(22, 163, 74)' : 
                 score >= 60 ? 'rgb(202, 138, 4)' : 
                 'rgb(220, 38, 38)';
        }),
        borderWidth: 1,
      },
    ],
  };

  // Chart options for bar chart
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Performance by Subject',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
    },
  };

  // Format data for Pie chart
  const formatScoresData = {
    labels: Object.keys(examResult.formatScores).map(format => 
      format.charAt(0).toUpperCase() + format.slice(1)
    ),
    datasets: [
      {
        data: Object.values(examResult.formatScores),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format data for Radar chart (difficulty breakdown)
  const difficultyScoresData = {
    labels: Object.keys(examResult.difficultyScores).map(diff => 
      diff.charAt(0).toUpperCase() + diff.slice(1)
    ),
    datasets: [
      {
        label: 'Score (%)',
        data: Object.values(examResult.difficultyScores),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  // Time by subject data
  const timeBySubjectData = {
    labels: Object.keys(examResult.timeBySubject),
    datasets: [
      {
        label: 'Time Spent (seconds)',
        data: Object.values(examResult.timeBySubject),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => {
            resetExamResult();
            navigate('/exams');
          }}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Practice Exams
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h1 className="text-3xl font-bold mb-2">{examResult.examTitle}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Badge className="bg-white text-blue-700">
              {examResult.examType}
            </Badge>
            <div className="text-sm">
              Duration: {examResult.examDuration} minutes
            </div>
            <div className="text-sm">
              Completed: {new Date(examResult.completedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {examResult.score}%
              </div>
              <div className="text-gray-600 text-center">
                Overall Score
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {examResult.correctCount}/{examResult.totalQuestions}
              </div>
              <div className="text-gray-600 text-center">
                Questions Correct
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {formatTime(examResult.totalTimeSpent)}
              </div>
              <div className="text-gray-600 text-center">
                Total Time Spent
              </div>
            </div>
          </div>

          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              <button
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === 'subjects' 
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('subjects')}
              >
                Subject Analysis
              </button>
              <button
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === 'questions' 
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('questions')}
              >
                Question Details
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-4">
                  <div className="h-80">
                    <Bar data={subjectScoresData} options={barOptions} />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="h-80 flex flex-col">
                    <h3 className="text-center text-gray-700 font-medium mb-4">Performance by Question Type</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-4/5 h-4/5">
                        <Pie data={formatScoresData} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-4">
                  <div className="h-80 flex flex-col">
                    <h3 className="text-center text-gray-700 font-medium mb-4">Performance by Difficulty</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-4/5 h-4/5">
                        <Radar data={difficultyScoresData} />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="h-80">
                    <Bar 
                      data={timeBySubjectData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Time Spent by Subject',
                            font: {
                              size: 16,
                            },
                          },
                        },
                      }} 
                    />
                  </div>
                </Card>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Performance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Strengths</h4>
                    {examResult.strongestSubject ? (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-medium text-gray-800 mb-1">
                          {examResult.strongestSubject}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {examResult.subjectScores[examResult.strongestSubject]}%
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Areas for Improvement</h4>
                    {examResult.weakestSubject ? (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-lg font-medium text-gray-800 mb-1">
                          {examResult.weakestSubject}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {examResult.subjectScores[examResult.weakestSubject]}%
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Time Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {formatTime(examResult.totalTimeSpent)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Time
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {formatTime(examResult.averageTimePerQuestion)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg. Time per Question
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {Math.round((examResult.totalTimeSpent / 60) / examResult.examDuration * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Of Available Time Used
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div className="grid grid-cols-1 gap-6 mb-8">
                {Object.entries(examResult.subjectFormatBreakdown).map(([subject, formatData]) => (
                  <Card key={subject} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{subject}</h3>
                      <Badge
                        variant={
                          examResult.subjectScores[subject] >= 80 ? 'success' : 
                          examResult.subjectScores[subject] >= 60 ? 'warning' : 
                          'danger'
                        }
                      >
                        {examResult.subjectScores[subject]}%
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Performance by Question Type
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(formatData).map(([format, { correct, total }]) => (
                          <div key={format} className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-700 font-medium mb-1 capitalize">
                              {format}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                {correct}/{total} correct
                              </div>
                              <Badge
                                variant={
                                  (correct / total * 100) >= 80 ? 'success' : 
                                  (correct / total * 100) >= 60 ? 'warning' : 
                                  'danger'
                                }
                              >
                                {Math.round(correct / total * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Time Analysis
                      </h4>
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-indigo-600">
                          {formatTime(examResult.timeBySubject[subject])}
                        </div>
                        <div className="text-sm text-gray-500 ml-2">
                          ({Math.round(examResult.timeBySubject[subject] / examResult.totalTimeSpent * 100)}% of total time)
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Format
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examResult.questionDetails.map((question, index) => (
                      <tr key={question.id} className={question.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {question.format}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {question.difficulty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {question.isCorrect ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Correct
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Incorrect
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(question.timeSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage; 