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
    const subjectPerformance: Record<string, { scores: number[]; studyTime: number; timestamps: Date[] }> = {};
    
    performanceData.forEach((data) => {
      if (!subjectPerformance[data.subject]) {
        subjectPerformance[data.subject] = { scores: [], studyTime: 0, timestamps: [] };
      }
      
      subjectPerformance[data.subject].scores.push(data.score);
      subjectPerformance[data.subject].studyTime += data.studyTime;
      subjectPerformance[data.subject].timestamps.push(data.date);
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

    // Calculate daily average for each subject
    const scoresTrendBySubject: { subject: string; dates: string[]; scores: number[] }[] = [];
    
    Object.entries(scoresBySubjectAndDate).forEach(([subject, dateScores]) => {
      const dates: string[] = [];
      const scores: number[] = [];
      
      Object.entries(dateScores)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .forEach(([date, { total, count }]) => {
          dates.push(date);
          scores.push(Math.round(total / count));
        });
      
      scoresTrendBySubject.push({
        subject,
        dates,
        scores,
      });
    });

    // NEW: Calculate improvement rate for each subject
    const improvementRates: Record<string, { improvementRate: number; correlation: number }> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { scores, timestamps }]) => {
      if (scores.length < 2) {
        improvementRates[subject] = { improvementRate: 0, correlation: 0 };
        return;
      }
      
      // Sort scores by timestamp
      const sortedData = timestamps.map((date, i) => ({ 
        timestamp: date.getTime(),
        score: scores[i]
      })).sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate linear regression
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      const n = sortedData.length;
      
      // Normalize timestamps to days since start
      const startDay = sortedData[0].timestamp;
      const normalizedData = sortedData.map(item => ({
        day: Math.floor((item.timestamp - startDay) / (1000 * 60 * 60 * 24)),
        score: item.score
      }));
      
      normalizedData.forEach(({ day, score }) => {
        sumX += day;
        sumY += score;
        sumXY += day * score;
        sumX2 += day * day;
        sumY2 += score * score;
      });
      
      // Calculate slope (points per day)
      const slope = n > 1 ? 
        (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 
        0;
      
      // Calculate correlation coefficient
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      const correlation = denominator !== 0 ? numerator / denominator : 0;
      
      // Calculate weekly improvement rate (points per week)
      const weeklyImprovement = slope * 7;
      
      improvementRates[subject] = { 
        improvementRate: parseFloat(weeklyImprovement.toFixed(2)),
        correlation: parseFloat(correlation.toFixed(2))
      };
    });

    // NEW: Calculate projected scores based on current improvement rate
    const projectedScores: Record<string, { current: number; oneWeek: number; oneMonth: number }> = {};
    
    Object.entries(subjectAverages).forEach(([subject, { averageScore }]) => {
      const { improvementRate } = improvementRates[subject] || { improvementRate: 0 };
      
      // Projected scores (capped at 100)
      const oneWeek = Math.min(100, Math.round(averageScore + improvementRate));
      const oneMonth = Math.min(100, Math.round(averageScore + improvementRate * 4));
      
      projectedScores[subject] = {
        current: averageScore,
        oneWeek,
        oneMonth
      };
    });

    // Send response
    res.status(200).json({
      rawData: performanceData,
      subjectAverages,
      dailyProgress,
      studyTimeBySubject,
      overallAverage,
      totalStudyTime: performanceData.reduce((acc, data) => acc + data.studyTime, 0),
      scoresTrendBySubject,
      // Advanced analytics
      improvementRates,
      projectedScores
    });
  } catch (error: any) {
    console.error('Performance data error:', error);
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