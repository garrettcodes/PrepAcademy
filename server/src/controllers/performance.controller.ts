import { Request, Response } from 'express';
import PerformanceData from '../models/performanceData.model';
import ExamAttempt from '../models/examAttempt.model';

// Get user's performance data
export const getPerformanceData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subject, startDate, endDate } = req.query;

    // Build filter object
    const filter: any = { userId };
    
    if (subject) filter.subject = subject;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    // Get performance data
    const performanceData = await PerformanceData.find(filter).sort({ date: -1 });

    // Group by subject and calculate averages
    const subjectPerformance: Record<string, { scores: number[]; studyTime: number }> = {};
    
    performanceData.forEach((data) => {
      if (!subjectPerformance[data.subject]) {
        subjectPerformance[data.subject] = { scores: [], studyTime: 0 };
      }
      
      subjectPerformance[data.subject].scores.push(data.score);
      subjectPerformance[data.subject].studyTime += data.studyTime;
    });

    // Calculate average scores
    const subjectAverages: Record<string, { averageScore: number; totalStudyTime: number }> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { scores, studyTime }]) => {
      const sum = scores.reduce((acc, score) => acc + score, 0);
      const average = scores.length > 0 ? Math.round(sum / scores.length) : 0;
      
      subjectAverages[subject] = {
        averageScore: average,
        totalStudyTime: studyTime,
      };
    });

    // Get exam attempts
    const examAttempts = await ExamAttempt.find({ userId, completed: true }).sort({ endTime: -1 });

    // Calculate overall progress
    const allScores = performanceData.map(data => data.score);
    const overallAverage = allScores.length > 0
      ? Math.round(allScores.reduce((acc, score) => acc + score, 0) / allScores.length)
      : 0;

    // Calculate progress over time (group by day)
    const progressByDay: Record<string, { date: string; averageScore: number }> = {};
    
    performanceData.forEach((data) => {
      const dateStr = data.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!progressByDay[dateStr]) {
        progressByDay[dateStr] = { date: dateStr, averageScore: 0, count: 0 };
      }
      
      progressByDay[dateStr].averageScore += data.score;
      progressByDay[dateStr].count += 1;
    });
    
    // Calculate daily averages
    const dailyProgress = Object.entries(progressByDay).map(([date, { averageScore, count }]) => ({
      date,
      averageScore: Math.round(averageScore / count),
    }));

    // Sort by date
    dailyProgress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({
      subjectAverages,
      overallAverage,
      dailyProgress,
      examAttempts,
      totalStudyTime: Object.values(subjectAverages).reduce(
        (acc, { totalStudyTime }) => acc + totalStudyTime,
        0
      ),
    });
  } catch (error: any) {
    console.error('Get performance data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 