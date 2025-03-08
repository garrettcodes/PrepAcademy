import React, { useState, useEffect, useCallback } from 'react';
import { usePerformance } from '../../context/PerformanceContext';

interface StudyTimerProps {
  subject: string;
  subtopic: string;
  onComplete?: (studyTimeMinutes: number) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ subject, subtopic, onComplete }) => {
  const { startStudyTimer, stopStudyTimer } = usePerformance();
  const [timerId, setTimerId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // In seconds
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Start the timer
  const handleStart = useCallback(() => {
    if (!isActive) {
      // Start the timer in the PerformanceContext
      const newTimerId = startStudyTimer(subject, subtopic);
      setTimerId(newTimerId);
      
      // Update local state
      setIsActive(true);
      setStartTime(new Date());
      setElapsedTime(0);
    }
  }, [isActive, startStudyTimer, subject, subtopic]);

  // Stop the timer
  const handleStop = useCallback(async () => {
    if (isActive && timerId) {
      // Stop the timer in the PerformanceContext
      await stopStudyTimer(timerId);
      
      // Update local state
      setIsActive(false);
      setTimerId(null);
      
      // Call onComplete callback with total minutes
      const minutes = Math.ceil(elapsedTime / 60);
      if (onComplete) {
        onComplete(minutes);
      }
    }
  }, [isActive, timerId, stopStudyTimer, elapsedTime, onComplete]);

  // Update elapsed time every second
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        setElapsedTime(Math.floor(diff / 1000));
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // If the timer is active when the component unmounts, stop it
      if (isActive && timerId) {
        stopStudyTimer(timerId);
      }
    };
  }, [isActive, timerId, stopStudyTimer]);

  // Format elapsed time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">Study Timer</h3>
        <p className="text-sm text-gray-600">{subject} - {subtopic}</p>
      </div>
      
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-blue-600 font-mono">
          {formatTime(elapsedTime)}
        </span>
      </div>
      
      <div className="flex justify-center space-x-2">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyTimer; 