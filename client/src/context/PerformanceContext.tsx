import React, { createContext, useContext, useEffect, useState } from 'react';
import performanceService from '../services/performanceService';
import { useAuth } from './AuthContext';
import axios from 'axios';

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
  scores: number[];
}

interface StudyTimeSubject {
  subject: string;
  studyTime: number;
}

// New analytics interfaces
interface ImprovementRate {
  improvementRate: number;
  correlation: number;
}

interface ProjectedScore {
  current: number;
  oneWeek: number;
  oneMonth: number;
}

// Define performance summary interface
interface PerformanceSummary {
  totalPracticeQuestions: number;
  correctAnswers: number;
  totalExamsTaken: number;
  averageScore: number;
  recentScores: {
    date: string;
    score: number;
  }[];
  improvementAreas: {
    subject: string;
    topic: string;
    accuracyRate: number;
  }[];
  strengths: {
    subject: string;
    topic: string;
    accuracyRate: number;
  }[];
  questionsAnswered: number;
  studyTimeHours: number;
}

// Define performance context interface
export interface PerformanceContextProps {
  performanceSummary: PerformanceSummary | null;
  fetchPerformanceSummary: () => Promise<void>;
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
  // Advanced analytics
  improvementRates: Record<string, ImprovementRate>;
  projectedScores: Record<string, ProjectedScore>;
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
  // New state for advanced analytics
  const [improvementRates, setImprovementRates] = useState<Record<string, ImprovementRate>>({});
  const [projectedScores, setProjectedScores] = useState<Record<string, ProjectedScore>>({});
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);

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
      // Set advanced analytics data
      setImprovementRates(data.improvementRates || {});
      setProjectedScores(data.projectedScores || {});
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

  // Fetch performance summary
  const fetchPerformanceSummary = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/summary`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setPerformanceSummary(response.data);
    } catch (err: any) {
      console.error('Error fetching performance summary:', err);
      setError(
        err.response?.data?.message ||
          'Failed to fetch performance summary. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance data on initial load if user is authenticated
  useEffect(() => {
    if (user) {
      fetchPerformanceData();
      fetchPerformanceSummary();
    }
  }, [user]);

  return (
    <PerformanceContext.Provider
      value={{
        performanceSummary,
        fetchPerformanceSummary,
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
        // Advanced analytics
        improvementRates,
        projectedScores,
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