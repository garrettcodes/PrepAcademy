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
    const progressByDay: Record<string, { date: string; averageScore: number; count: number }> = {};
    
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

    // Calculate study time by subject (for bar chart)
    const studyTimeBySubject = Object.entries(subjectAverages).map(([subject, data]) => ({
      subject,
      studyTime: data.totalStudyTime,
    }));

    // Calculate score trends over time by subject
    const scoresBySubjectAndDate: Record<string, Record<string, { total: number; count: number }>> = {};

    // Initialize with all subjects
    performanceData.forEach((data) => {
      if (!scoresBySubjectAndDate[data.subject]) {
        scoresBySubjectAndDate[data.subject] = {};
      }
    });

    // Populate scores by date for each subject
    performanceData.forEach((data) => {
      const dateStr = data.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!scoresBySubjectAndDate[data.subject][dateStr]) {
        scoresBySubjectAndDate[data.subject][dateStr] = { total: 0, count: 0 };
      }
      
      scoresBySubjectAndDate[data.subject][dateStr].total += data.score;
      scoresBySubjectAndDate[data.subject][dateStr].count += 1;
    });

    // Convert to array format for chart.js
    const scoresTrendBySubject = Object.entries(scoresBySubjectAndDate).map(([subject, dateScores]) => {
      // Get all unique dates across all subjects
      const allDates = [...new Set(
        performanceData.map(data => data.date.toISOString().split('T')[0])
      )].sort();
      
      // For each date, get the average score or null if no data
      const data = allDates.map(date => {
        if (dateScores[date]) {
          return Math.round(dateScores[date].total / dateScores[date].count);
        }
        return null; // No data for this date
      });
      
      return {
        subject,
        dates: allDates,
        scores: data,
      };
    });

    res.status(200).json({
      subjectAverages,
      overallAverage,
      dailyProgress,
      examAttempts,
      totalStudyTime: Object.values(subjectAverages).reduce(
        (acc, { totalStudyTime }) => acc + totalStudyTime,
        0
      ),
      studyTimeBySubject,
      scoresTrendBySubject,
      rawData: performanceData // Include raw data for custom processing on the client
    });
  } catch (error: any) {
    console.error('Get performance data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save study time
export const saveStudyTime = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subject, subtopic, studyTime, score = 0 } = req.body;

    // Validate required fields
    if (!subject || !subtopic || studyTime === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: subject, subtopic, and studyTime are required' 
      });
    }

    // Validate study time is a positive number
    if (typeof studyTime !== 'number' || studyTime < 0) {
      return res.status(400).json({ message: 'Study time must be a positive number in minutes' });
    }

    // Create new performance data entry
    const performanceData = await PerformanceData.create({
      userId,
      subject,
      subtopic,
      studyTime,
      score,
      date: new Date(),
    });

    res.status(201).json(performanceData);
  } catch (error: any) {
    console.error('Save study time error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 