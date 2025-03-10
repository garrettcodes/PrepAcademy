import React, { useState, useEffect } from 'react';
import { usePerformance } from '../../context/PerformanceContext';

const StudyTimeTest: React.FC = () => {
  const { startStudyTimer, stopStudyTimer } = usePerformance();
  const [timerId, setTimerId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [subject, setSubject] = useState('Math');
  const [subtopic, setSubtopic] = useState('Algebra');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  // Add a log message
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Start the timer
  const handleStartTimer = () => {
    const newTimerId = startStudyTimer(subject, subtopic);
    setTimerId(newTimerId);
    setIsTracking(true);
    setElapsedTime(0);
    addLog(`Started timer ${newTimerId} for ${subject}/${subtopic}`);
  };
  
  // Stop the timer
  const handleStopTimer = async () => {
    if (timerId) {
      await stopStudyTimer(timerId);
      addLog(`Stopped timer ${timerId} after ${Math.round(elapsedTime / 60)} minutes ${elapsedTime % 60} seconds`);
      setTimerId(null);
      setIsTracking(false);
    }
  };
  
  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Study Time Tracking Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isTracking}
            >
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="subtopic" className="block text-sm font-medium text-gray-700 mb-1">
              Subtopic
            </label>
            <input
              type="text"
              id="subtopic"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={isTracking}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl font-mono font-bold text-blue-600">
            {formatTime(elapsedTime)}
          </div>
          
          {!isTracking ? (
            <button
              onClick={handleStartTimer}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Stop Timer
            </button>
          )}
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">
            {isTracking 
              ? 'Timer is running. Stop the timer to record the study time.'
              : 'Press Start Timer to begin tracking study time.'}
          </p>
          <p className="text-sm text-gray-500">
            After stopping the timer, check the Performance dashboard to verify the study time is recorded.
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Log</h2>
        <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {logMessages.length > 0 ? (
            <ul className="space-y-1">
              {logMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimeTest; 