import React, { useState, useEffect, useRef } from 'react';

interface BreathingExerciseProps {
  duration?: number; // in seconds
  onComplete?: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  duration = 120,
  onComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [breathCount, setBreathCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  
  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, []);
  
  // Main timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onComplete]);
  
  // Breathing cycle effect
  useEffect(() => {
    if (isRunning) {
      startBreathCycle();
    } else {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    }
    
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [isRunning, breathCount]);
  
  const startBreathCycle = () => {
    // Start with inhale
    setBreathPhase('inhale');
    
    // Set timeouts for each phase
    // Inhale for 4 seconds
    phaseTimerRef.current = window.setTimeout(() => {
      setBreathPhase('hold');
      
      // Hold for 4 seconds
      phaseTimerRef.current = window.setTimeout(() => {
        setBreathPhase('exhale');
        
        // Exhale for 6 seconds
        phaseTimerRef.current = window.setTimeout(() => {
          setBreathPhase('rest');
          
          // Rest for 2 seconds, then start next breath cycle
          phaseTimerRef.current = window.setTimeout(() => {
            setBreathCount(prev => prev + 1);
          }, 2000);
        }, 6000);
      }, 4000);
    }, 4000);
  };
  
  const toggleExercise = () => {
    if (isRunning) {
      setIsRunning(false);
      setBreathPhase('rest');
    } else {
      setIsRunning(true);
      setSecondsLeft(duration);
    }
  };
  
  const resetExercise = () => {
    setIsRunning(false);
    setSecondsLeft(duration);
    setBreathPhase('rest');
    setBreathCount(0);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate the size of the breathing circle based on the current phase
  const getCircleSize = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'scale-100';
      case 'hold':
        return 'scale-100';
      case 'exhale':
        return 'scale-75';
      case 'rest':
        return 'scale-75';
      default:
        return 'scale-75';
    }
  };
  
  // Get instruction text based on the current phase
  const getInstructionText = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'rest':
        return 'Rest';
      default:
        return 'Get Ready';
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Breathing Exercise</h3>
      
      <div className="mb-6 text-center">
        <p className="text-gray-600 mb-4">
          This exercise uses the 4-4-6 breathing technique to reduce anxiety and promote calm.
          Breathe in for 4 seconds, hold for 4 seconds, then exhale for 6 seconds.
        </p>
      </div>
      
      {/* Timer display */}
      <div className="text-2xl font-bold mb-6">{formatTime(secondsLeft)}</div>
      
      {/* Breathing circle */}
      <div className="relative mb-8">
        <div
          className={`w-48 h-48 rounded-full flex items-center justify-center bg-blue-100 border-4 border-blue-300 transition-transform duration-1000 ${getCircleSize()}`}
        >
          <div className="text-xl font-medium text-blue-800">{getInstructionText()}</div>
        </div>
        
        {/* Indicators for the breathing phase */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${breathPhase === 'inhale' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${breathPhase === 'hold' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${breathPhase === 'exhale' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${breathPhase === 'rest' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={toggleExercise}
          className={`px-6 py-2 rounded-md ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? 'Pause' : secondsLeft < duration ? 'Resume' : 'Start'}
        </button>
        
        <button
          onClick={resetExercise}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BreathingExercise; 