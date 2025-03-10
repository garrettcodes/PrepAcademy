import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useParentAuth } from '../../context/ParentAuthContext';
import { useReport } from '../../context/ReportContext';

const StudentReports = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { parent, isAuthenticated, loading, getStudentDetails } = useParentAuth();
  const { 
    loading: reportLoading, 
    error: reportError,
    progressReport,
    studyTimeReport,
    taskCompletionReport,
    getProgressReport,
    getStudyTimeReport,
    getTaskCompletionReport
  } = useReport();

  const [reportType, setReportType] = useState<string>(searchParams.get('type') || 'progress');
  const [timeframe, setTimeframe] = useState<string>('all');
  const [studentName, setStudentName] = useState<string>('');
  const navigate = useNavigate();

  // Protect this route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Update report type from search params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['progress', 'study-time', 'task-completion'].includes(type)) {
      setReportType(type);
    }
  }, [searchParams]);

  // Fetch student name
  useEffect(() => {
    const fetchStudentName = async () => {
      if (studentId && parent) {
        try {
          const studentData = await getStudentDetails(studentId);
          if (studentData) {
            setStudentName(studentData.name);
          }
        } catch (error) {
          console.error('Error fetching student name:', error);
        }
      }
    };

    fetchStudentName();
  }, [studentId, parent, getStudentDetails]);

  // Fetch appropriate report based on report type and timeframe
  useEffect(() => {
    const fetchReport = async () => {
      if (!studentId || !parent) return;

      try {
        switch (reportType) {
          case 'progress':
            await getProgressReport(studentId, timeframe);
            break;
          case 'study-time':
            await getStudyTimeReport(studentId, timeframe);
            break;
          case 'task-completion':
            await getTaskCompletionReport(studentId, timeframe);
            break;
          default:
            await getProgressReport(studentId, timeframe);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [
    studentId, 
    parent, 
    reportType, 
    timeframe, 
    getProgressReport, 
    getStudyTimeReport, 
    getTaskCompletionReport
  ]);

  // Handle report type change
  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    setSearchParams({ type });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Loading state
  if (loading || reportLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Reports</h1>
          <Link
            to={`/parent/student/${studentId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Back to Student Details
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Report Type Selection */}
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {studentName ? `${studentName}'s Reports` : 'Student Reports'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Select the type of report you want to generate
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => handleReportTypeChange('progress')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    reportType === 'progress'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Progress Report
                </button>
                <button
                  onClick={() => handleReportTypeChange('study-time')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    reportType === 'study-time'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Study Time Report
                </button>
                <button
                  onClick={() => handleReportTypeChange('task-completion')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    reportType === 'task-completion'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Task Completion Report
                </button>
              </div>

              <div className="mb-6">
                <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
                  Timeframe
                </label>
                <select
                  id="timeframe"
                  name="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {reportType === 'progress' && 'Progress Report'}
                {reportType === 'study-time' && 'Study Time Report'}
                {reportType === 'task-completion' && 'Task Completion Report'}
              </h3>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {timeframe === 'all' && 'All Time'}
                {timeframe === 'week' && 'Last Week'}
                {timeframe === 'month' && 'Last Month'}
              </span>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {reportError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{reportError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Report Content */}
              {reportType === 'progress' && progressReport && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Average Score</h4>
                      <p className="text-3xl font-bold text-indigo-600">{progressReport.statistics.averageScore}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Accuracy</h4>
                      <p className="text-3xl font-bold text-indigo-600">{progressReport.statistics.accuracy}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Study Time</h4>
                      <p className="text-3xl font-bold text-indigo-600">{formatTime(progressReport.statistics.totalStudyTimeMinutes)}</p>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900 mb-4">Exam Scores</h4>
                  {progressReport.statistics.examScores.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Exam Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {progressReport.statistics.examScores.map((score, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{score.examName}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{score.score}%</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(score.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-8">No exam scores available.</p>
                  )}

                  <h4 className="text-md font-medium text-gray-900 mb-4">Subject Performance</h4>
                  {Object.keys(progressReport.statistics.subjectPerformance).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(progressReport.statistics.subjectPerformance).map(([subject, data]) => (
                        <div key={subject} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{subject}</h5>
                          <p className="text-sm text-gray-500">Accuracy: <span className="font-medium text-indigo-600">{data.accuracy}%</span></p>
                          <p className="text-sm text-gray-500">Questions: <span className="font-medium">{data.totalQuestions}</span></p>
                          <p className="text-sm text-gray-500">Correct: <span className="font-medium text-green-600">{data.correctAnswers}</span></p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subject performance data available.</p>
                  )}
                </div>
              )}

              {/* Study Time Report Content */}
              {reportType === 'study-time' && studyTimeReport && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Study Time</h4>
                      <p className="text-3xl font-bold text-indigo-600">{formatTime(studyTimeReport.studyTimeStats.totalStudyTimeMinutes)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Avg. Daily Study Time</h4>
                      <p className="text-3xl font-bold text-indigo-600">{formatTime(studyTimeReport.studyTimeStats.averageDailyStudyTimeMinutes)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Most Productive Day</h4>
                      {studyTimeReport.studyTimeStats.mostProductiveDay ? (
                        <div>
                          <p className="text-xl font-bold text-indigo-600">{formatDate(studyTimeReport.studyTimeStats.mostProductiveDay.date)}</p>
                          <p className="text-sm text-gray-500">{formatTime(studyTimeReport.studyTimeStats.mostProductiveDay.studyTimeMinutes)}</p>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-400">None</p>
                      )}
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900 mb-4">Study Time by Subject</h4>
                  {Object.keys(studyTimeReport.studyTimeStats.studyTimeBySubject).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      {Object.entries(studyTimeReport.studyTimeStats.studyTimeBySubject).map(([subject, minutes]) => (
                        <div key={subject} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{subject}</h5>
                          <p className="text-lg font-medium text-indigo-600">{formatTime(minutes)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-8">No subject study time data available.</p>
                  )}

                  <h4 className="text-md font-medium text-gray-900 mb-4">Daily Study Log</h4>
                  {studyTimeReport.dailyStudyTime.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Time</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subjects Studied</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {studyTimeReport.dailyStudyTime.map((day, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{formatDate(day.date)}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatTime(day.totalMinutes)}</td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                {Object.entries(day.subjects).map(([subject, time], i) => (
                                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
                                    {subject}: {formatTime(time as number)}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No daily study log data available.</p>
                  )}
                </div>
              )}

              {/* Task Completion Report Content */}
              {reportType === 'task-completion' && taskCompletionReport && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Tasks</h4>
                      <p className="text-3xl font-bold text-indigo-600">{taskCompletionReport.taskStats.totalTasks}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Completed Tasks</h4>
                      <p className="text-3xl font-bold text-indigo-600">{taskCompletionReport.taskStats.completedTasks}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Completion Rate</h4>
                      <p className="text-3xl font-bold text-indigo-600">{taskCompletionReport.taskStats.completionRate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Upcoming Tasks</h4>
                      {taskCompletionReport.taskStats.upcomingTasks.length > 0 ? (
                        <ul className="divide-y divide-gray-200 bg-white shadow rounded-md">
                          {taskCompletionReport.taskStats.upcomingTasks.map((task, index) => (
                            <li key={index} className="px-4 py-4">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
                                    {task.week}W
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                                  <p className="text-sm text-gray-500">
                                    Week {task.week}, Day {task.day} - {task.subject}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No upcoming tasks.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Recently Completed Tasks</h4>
                      {taskCompletionReport.taskStats.recentlyCompletedTasks.length > 0 ? (
                        <ul className="divide-y divide-gray-200 bg-white shadow rounded-md">
                          {taskCompletionReport.taskStats.recentlyCompletedTasks.map((task, index) => (
                            <li key={index} className="px-4 py-4">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <span className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                                    ✓
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                                  <div className="flex items-center">
                                    <p className="text-sm text-gray-500 mr-2">
                                      {formatDate(task.date)} - {task.subject}
                                    </p>
                                    {task.score && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Score: {task.score}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No recently completed tasks.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!progressReport && !studyTimeReport && !taskCompletionReport && !reportLoading && !reportError && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Select a report type and timeframe to generate a report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentReports; 