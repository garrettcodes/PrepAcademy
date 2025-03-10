import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  TimeScale,
  RadialLinearScale,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { usePerformance } from '../../context/PerformanceContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  RadialLinearScale
);

const Performance: React.FC = () => {
  const { 
    loading, 
    error,
    subjectAverages, 
    dailyProgress, 
    studyTimeBySubject, 
    scoresTrendBySubject,
    overallAverage,
    totalStudyTime,
    // Advanced analytics
    improvementRates,
    projectedScores,
    fetchPerformanceData
  } = usePerformance();
  
  const [subject, setSubject] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Colors for different subjects
  const subjectColors: Record<string, string> = {
    'Math': 'rgba(54, 162, 235, 0.6)',
    'Reading': 'rgba(255, 99, 132, 0.6)',
    'Writing': 'rgba(75, 192, 192, 0.6)',
    'English': 'rgba(153, 102, 255, 0.6)',
    'Science': 'rgba(255, 159, 64, 0.6)',
  };

  const borderColors: Record<string, string> = {
    'Math': 'rgba(54, 162, 235, 1)',
    'Reading': 'rgba(255, 99, 132, 1)',
    'Writing': 'rgba(75, 192, 192, 1)',
    'English': 'rgba(153, 102, 255, 1)',
    'Science': 'rgba(255, 159, 64, 1)',
  };

  // Line chart data (score trends)
  const scoreLineChartData = {
    datasets: scoresTrendBySubject.map(trend => ({
      label: trend.subject,
      data: trend.scores.map((score, i) => ({
        x: trend.dates[i],
        y: score
      })).filter(item => item.y !== null),
      borderColor: borderColors[trend.subject] || 'rgba(0, 0, 0, 0.6)',
      backgroundColor: subjectColors[trend.subject] || 'rgba(0, 0, 0, 0.1)',
      tension: 0.2,
      spanGaps: true,
    })),
  };

  // Line chart options
  const scoreLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        type: 'category'
      },
      y: {
        title: {
          display: true,
          text: 'Score',
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Score Trends by Subject',
      },
    },
  };

  // Bar chart data (study time)
  const studyTimeBarChartData = {
    labels: studyTimeBySubject.map(item => item.subject),
    datasets: [
      {
        label: 'Study Time (minutes)',
        data: studyTimeBySubject.map(item => item.studyTime),
        backgroundColor: studyTimeBySubject.map(item => subjectColors[item.subject] || 'rgba(0, 0, 0, 0.1)'),
        borderColor: studyTimeBySubject.map(item => borderColors[item.subject] || 'rgba(0, 0, 0, 0.6)'),
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const studyTimeBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Minutes',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Study Time by Subject',
      },
    },
  };

  // NEW: Projected Scores Chart
  const projectedScoresData = {
    labels: Object.keys(projectedScores),
    datasets: [
      {
        label: 'Current Score',
        data: Object.values(projectedScores).map(scores => scores.current),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Projected (1 Week)',
        data: Object.values(projectedScores).map(scores => scores.oneWeek),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Projected (1 Month)',
        data: Object.values(projectedScores).map(scores => scores.oneMonth),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const projectedScoresOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Score',
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Current vs Projected Scores',
      },
    },
  };

  // NEW: Improvement Rates Chart
  const improvementRatesData = {
    labels: Object.keys(improvementRates),
    datasets: [
      {
        label: 'Weekly Improvement Rate',
        data: Object.values(improvementRates).map(rate => rate.improvementRate),
        backgroundColor: Object.keys(improvementRates).map(
          subject => subjectColors[subject] || 'rgba(0, 0, 0, 0.1)'
        ),
        borderColor: Object.keys(improvementRates).map(
          subject => borderColors[subject] || 'rgba(0, 0, 0, 0.6)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const improvementRatesOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Points per Week',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Improvement Rate by Subject',
      },
    },
  };

  // NEW: Performance Radar Chart
  const radarData = {
    labels: Object.keys(subjectAverages),
    datasets: [
      {
        label: 'Current Scores',
        data: Object.values(subjectAverages).map(data => data.averageScore),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      }
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Score Balance by Subject',
      },
    },
  };

  // Handle form submission for filtering
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPerformanceData(subject || undefined, startDate || undefined, endDate || undefined);
  };

  const resetFilters = () => {
    setSubject('');
    setStartDate('');
    setEndDate('');
    fetchPerformanceData();
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Performance Dashboard</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label htmlFor="subject" className="text-gray-700 mb-1">Subject</label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All Subjects</option>
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-blue-600">{overallAverage}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-1">Total Study Time</h3>
          <p className="text-3xl font-bold text-green-600">{formatTime(totalStudyTime)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-1">Subjects Studied</h3>
          <p className="text-3xl font-bold text-purple-600">{Object.keys(subjectAverages).length}</p>
        </div>
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Trends Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Score Trends</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading chart data...</p>
            </div>
          ) : scoresTrendBySubject.length > 0 ? (
            <div className="h-64">
              <Line data={scoreLineChartData} options={scoreLineChartOptions} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              <p>No score data available</p>
            </div>
          )}
        </div>

        {/* Study Time Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Study Time by Subject</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading chart data...</p>
            </div>
          ) : studyTimeBySubject.length > 0 ? (
            <div className="h-64">
              <Bar data={studyTimeBarChartData} options={studyTimeBarChartOptions} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              <p>No study time data available</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW: Advanced Analytics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Analytics</h2>
        
        {/* Projected Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Projected Scores</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart data...</p>
              </div>
            ) : Object.keys(projectedScores).length > 0 ? (
              <div className="h-64">
                <Bar data={projectedScoresData} options={projectedScoresOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                <p>No projection data available</p>
              </div>
            )}
          </div>

          {/* Improvement Rates */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Weekly Improvement Rate</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart data...</p>
              </div>
            ) : Object.keys(improvementRates).length > 0 ? (
              <div className="h-64">
                <Bar data={improvementRatesData} options={improvementRatesOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                <p>Not enough data for improvement analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Radar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Balance</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading chart data...</p>
            </div>
          ) : Object.keys(subjectAverages).length > 2 ? (
            <div className="h-80 max-w-2xl mx-auto">
              <Radar data={radarData} options={radarOptions} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              <p>Need data for at least 3 subjects for radar chart</p>
            </div>
          )}
        </div>

        {/* Projected Score Details Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Personalized Score Predictions</h2>
          {Object.keys(projectedScores).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Subject</th>
                    <th className="border px-4 py-2 text-left">Current Score</th>
                    <th className="border px-4 py-2 text-left">Weekly Improvement</th>
                    <th className="border px-4 py-2 text-left">Projected 1 Week</th>
                    <th className="border px-4 py-2 text-left">Projected 1 Month</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(projectedScores).map(([subject, scores]) => (
                    <tr key={subject} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{subject}</td>
                      <td className="border px-4 py-2">{scores.current}%</td>
                      <td className="border px-4 py-2">
                        {improvementRates[subject]?.improvementRate > 0 
                          ? `+${improvementRates[subject].improvementRate.toFixed(1)} pts/week` 
                          : `${improvementRates[subject]?.improvementRate.toFixed(1)} pts/week`}
                      </td>
                      <td className="border px-4 py-2">{scores.oneWeek}%</td>
                      <td className="border px-4 py-2">{scores.oneMonth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No projection data available</p>
          )}
        </div>
      </div>

      {/* Subject Details */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Subject Breakdown</h2>
        {Object.keys(subjectAverages).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Subject</th>
                  <th className="border px-4 py-2 text-left">Average Score</th>
                  <th className="border px-4 py-2 text-left">Study Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(subjectAverages).map(([subject, data]) => (
                  <tr key={subject} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{subject}</td>
                    <td className="border px-4 py-2">{data.averageScore}%</td>
                    <td className="border px-4 py-2">{formatTime(data.totalStudyTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No subject data available</p>
        )}
      </div>
    </div>
  );
};

export default Performance; 