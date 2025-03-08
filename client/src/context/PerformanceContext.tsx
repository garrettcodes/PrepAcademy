import React, { createContext, useContext, useEffect, useState } from 'react';
import performanceService from '../services/performanceService';
import { useAuth } from './AuthContext';

// Types for performance data
interface PerformanceData {
  _id: string;
  userId: string;
  subject: string;
  subtopic: string;
  score: number;
  studyTime: number;
  date: Date;
}

interface SubjectAverage {
  averageScore: number;
  totalStudyTime: number;
}

interface DailyProgress {
  date: string;
  averageScore: number;
}

interface SubjectTrend {
  subject: string;
  dates: string[];
  scores: (number | null)[];
}

interface StudyTimeSubject {
  subject: string;
  studyTime: number;
}

interface PerformanceContextProps {
  loading: boolean;
  error: string | null;
  performanceData: PerformanceData[];
  subjectAverages: Record<string, SubjectAverage>;
  dailyProgress: DailyProgress[];
  studyTimeBySubject: StudyTimeSubject[];
  overallAverage: number;
  totalStudyTime: number;
  scoresTrendBySubject: SubjectTrend[];
  studyTimers: Record<string, { start: Date; subject: string; subtopic: string; }>;
  fetchPerformanceData: (subject?: string, startDate?: string, endDate?: string) => Promise<void>;
  startStudyTimer: (subject: string, subtopic: string) => string;
  stopStudyTimer: (timerId: string, score?: number) => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextProps | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<Record<string, SubjectAverage>>({});
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [studyTimeBySubject, setStudyTimeBySubject] = useState<StudyTimeSubject[]>([]);
  const [scoresTrendBySubject, setScoresTrendBySubject] = useState<SubjectTrend[]>([]);
  const [overallAverage, setOverallAverage] = useState<number>(0);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [studyTimers, setStudyTimers] = useState<Record<string, { start: Date; subject: string; subtopic: string; }>>({});

  // Fetch performance data
  const fetchPerformanceData = async (subject?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await performanceService.getPerformanceData(subject, startDate, endDate);
      
      setPerformanceData(data.rawData || []);
      setSubjectAverages(data.subjectAverages || {});
      setDailyProgress(data.dailyProgress || []);
      setOverallAverage(data.overallAverage || 0);
      setTotalStudyTime(data.totalStudyTime || 0);
      setStudyTimeBySubject(data.studyTimeBySubject || []);
      setScoresTrendBySubject(data.scoresTrendBySubject || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance data');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start a study timer for a subject
  const startStudyTimer = (subject: string, subtopic: string): string => {
    const timerId = `timer_${Date.now()}`;
    setStudyTimers(prev => ({
      ...prev,
      [timerId]: {
        start: new Date(),
        subject,
        subtopic,
      }
    }));
    return timerId;
  };

  // Stop a study timer and save the study time
  const stopStudyTimer = async (timerId: string, score?: number): Promise<void> => {
    const timer = studyTimers[timerId];
    if (!timer) return;

    // Calculate duration in minutes
    const endTime = new Date();
    const durationMs = endTime.getTime() - timer.start.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    try {
      // Save study time to backend
      await performanceService.saveStudyTime(
        timer.subject,
        timer.subtopic,
        durationMinutes,
        score
      );

      // Remove timer
      setStudyTimers(prev => {
        const updatedTimers = { ...prev };
        delete updatedTimers[timerId];
        return updatedTimers;
      });

      // Refresh performance data
      await fetchPerformanceData();
    } catch (err: any) {
      setError(err.message || 'Failed to save study time');
      console.error('Error saving study time:', err);
    }
  };

  // Fetch performance data on initial load if user is authenticated
  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user]);

  return (
    <PerformanceContext.Provider
      value={{
        loading,
        error,
        performanceData,
        subjectAverages,
        dailyProgress,
        studyTimeBySubject,
        overallAverage,
        totalStudyTime,
        scoresTrendBySubject,
        studyTimers,
        fetchPerformanceData,
        startStudyTimer,
        stopStudyTimer,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}; 