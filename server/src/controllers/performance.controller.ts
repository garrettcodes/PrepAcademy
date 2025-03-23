import { Request, Response } from 'express';
import PerformanceData from '../models/performanceData.model';
import ExamAttempt from '../models/examAttempt.model';
import mongoose from 'mongoose';

// Helper to convert string ID to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Get user's performance data
export const getPerformanceData = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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

// Get basic performance overview (limited data for trial users)
export const getBasicPerformanceOverview = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get limited performance data
    const performanceData = await PerformanceData.find({ userId })
      .sort({ date: -1 })
      .limit(5); // Limit to 5 records for trial users

    // Calculate overall average
    const allScores = performanceData.map(data => data.score);
    const overallAverage = allScores.length > 0
      ? Math.round(allScores.reduce((acc, score) => acc + score, 0) / allScores.length)
      : 0;

    // Calculate total study time
    const totalStudyTime = performanceData.reduce((acc, data) => acc + data.studyTime, 0);

    // Send limited response for trial users
    res.status(200).json({
      rawData: performanceData,
      overallAverage,
      totalStudyTime,
      message: 'For more detailed analytics, upgrade to a premium subscription'
    });
  } catch (error: any) {
    console.error('Basic performance overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed performance analytics
export const getPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    // This is just an alias for the getPerformanceData function for backward compatibility
    await getPerformanceData(req, res);
  } catch (error: any) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get subject-specific performance breakdown
export const getSubjectPerformance = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get performance data grouped by subject
    const performanceData = await PerformanceData.find({ userId });

    // Group by subject and calculate metrics
    const subjectPerformance: Record<string, { scores: number[]; studyTime: number; timestamps: Date[] }> = {};
    
    performanceData.forEach((data) => {
      if (!subjectPerformance[data.subject]) {
        subjectPerformance[data.subject] = { scores: [], studyTime: 0, timestamps: [] };
      }
      
      subjectPerformance[data.subject].scores.push(data.score);
      subjectPerformance[data.subject].studyTime += data.studyTime;
      subjectPerformance[data.subject].timestamps.push(data.date);
    });

    // Calculate subject metrics
    const subjectMetrics: Record<string, { 
      averageScore: number; 
      totalStudyTime: number;
      highestScore: number;
      lowestScore: number;
      recordCount: number;
    }> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { scores, studyTime }]) => {
      const sum = scores.reduce((acc, score) => acc + score, 0);
      const average = scores.length > 0 ? Math.round(sum / scores.length) : 0;
      
      subjectMetrics[subject] = {
        averageScore: average,
        totalStudyTime: studyTime,
        highestScore: Math.max(...scores, 0),
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        recordCount: scores.length
      };
    });

    res.status(200).json({
      subjectMetrics,
      rawData: performanceData
    });
  } catch (error: any) {
    console.error('Subject performance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get question-level performance details
export const getQuestionPerformance = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam attempts to analyze question performance
    const examAttempts = await ExamAttempt.find({ 
      userId, 
      completed: true 
    }).populate('answers.questionId');

    // Analyze question performance
    const questionMap: Record<string, { correct: number; total: number; timeSpent: number }> = {};
    
    for (const attempt of examAttempts) {
      for (const answer of attempt.answers) {
        const questionId = answer.questionId.toString();
        
        if (!questionMap[questionId]) {
          questionMap[questionId] = { correct: 0, total: 0, timeSpent: 0 };
        }
        
        if (answer.isCorrect) {
          questionMap[questionId].correct += 1;
        }
        
        questionMap[questionId].total += 1;
        questionMap[questionId].timeSpent += answer.timeSpent || 0;
      }
    }

    // Calculate performance metrics for each question
    const questionPerformance = Object.entries(questionMap).map(([questionId, { correct, total, timeSpent }]) => ({
      questionId,
      correctRate: Math.round((correct / total) * 100),
      totalAttempts: total,
      averageTimeSpent: total > 0 ? Math.round(timeSpent / total) : 0
    }));

    res.status(200).json(questionPerformance);
  } catch (error: any) {
    console.error('Question performance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get progress over time analytics
export const getProgressOverTime = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get performance data
    const performanceData = await PerformanceData.find({ userId }).sort({ date: 1 });

    // Group data by day
    const progressByDay: Record<string, { date: string; totalScore: number; count: number; studyTime: number }> = {};
    
    performanceData.forEach((data) => {
      const dateStr = data.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!progressByDay[dateStr]) {
        progressByDay[dateStr] = { date: dateStr, totalScore: 0, count: 0, studyTime: 0 };
      }
      
      progressByDay[dateStr].totalScore += data.score;
      progressByDay[dateStr].count += 1;
      progressByDay[dateStr].studyTime += data.studyTime;
    });
    
    // Calculate daily averages
    const dailyProgress = Object.entries(progressByDay).map(([date, { totalScore, count, studyTime }]) => ({
      date,
      averageScore: Math.round(totalScore / count),
      recordCount: count,
      studyTime
    }));

    // Sort by date
    dailyProgress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate rolling average (7-day)
    const rollingAverages: Array<{ date: string; rollingAverage: number }> = [];
    for (let i = 0; i < dailyProgress.length; i++) {
      const startIdx = Math.max(0, i - 6); // Get up to 6 days before
      const window = dailyProgress.slice(startIdx, i + 1);
      const totalScore = window.reduce((sum, day) => sum + day.averageScore * day.recordCount, 0);
      const totalCount = window.reduce((sum, day) => sum + day.recordCount, 0);
      
      rollingAverages.push({
        date: dailyProgress[i].date,
        rollingAverage: totalCount > 0 ? Math.round(totalScore / totalCount) : 0
      });
    }

    res.status(200).json({
      dailyProgress,
      rollingAverages
    });
  } catch (error: any) {
    console.error('Progress over time error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get personalized recommendations based on performance
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get performance data
    const performanceData = await PerformanceData.find({ userId });

    // Group by subject and calculate average scores
    const subjectScores: Record<string, { totalScore: number; count: number }> = {};
    
    performanceData.forEach((data) => {
      if (!subjectScores[data.subject]) {
        subjectScores[data.subject] = { totalScore: 0, count: 0 };
      }
      
      subjectScores[data.subject].totalScore += data.score;
      subjectScores[data.subject].count += 1;
    });

    // Calculate average for each subject
    const subjectAverages = Object.entries(subjectScores).map(([subject, { totalScore, count }]) => ({
      subject,
      averageScore: count > 0 ? Math.round(totalScore / count) : 0,
    }));

    // Sort by score (ascending) to find weakest subjects
    subjectAverages.sort((a, b) => a.averageScore - b.averageScore);

    // Generate recommendations
    const recommendations: Array<{ type: string; subject: string; message: string }> = [];
    
    // Recommend focusing on weakest subjects
    const weakSubjects = subjectAverages.slice(0, 2); // Two weakest subjects
    for (const subject of weakSubjects) {
      if (subject.averageScore < 70) { // If average score is below 70
        recommendations.push({
          type: 'subject',
          subject: subject.subject,
          message: `Focus on improving your ${subject.subject} skills. Your average score is ${subject.averageScore}%.`
        });
      }
    }

    // Recommend exam practice for high-scoring subjects
    const strongSubjects = [...subjectAverages].sort((a, b) => b.averageScore - a.averageScore).slice(0, 2);
    for (const subject of strongSubjects) {
      if (subject.averageScore > 80) { // If average score is above 80
        recommendations.push({
          type: 'exam',
          subject: subject.subject,
          message: `You're doing well in ${subject.subject}. Consider taking a practice exam to solidify your knowledge.`
        });
      }
    }

    res.status(200).json({
      recommendations,
      subjectPerformance: subjectAverages
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comparison with peer group
export const getPeerComparison = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's average scores by subject
    const userPerformance = await PerformanceData.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      { $group: { _id: '$subject', averageScore: { $avg: '$score' } } },
      { $project: { subject: '$_id', averageScore: { $round: ['$averageScore', 0] }, _id: 0 } }
    ]);

    // Get average scores for all users (anonymized peer data)
    const peerPerformance = await PerformanceData.aggregate([
      { $group: { _id: '$subject', averageScore: { $avg: '$score' }, userCount: { $addToSet: '$userId' } } },
      { $project: { 
          subject: '$_id', 
          averageScore: { $round: ['$averageScore', 0] }, 
          userCount: { $size: '$userCount' },
          _id: 0 
        } 
      }
    ]);

    // Combine user and peer data for comparison
    const comparisonData: Array<{
      subject: string;
      userScore: number;
      peerScore: number;
      difference: number;
      percentile: number;
    }> = [];
    
    for (const peerData of peerPerformance) {
      const userData = userPerformance.find(p => p.subject === peerData.subject);
      if (userData) {
        comparisonData.push({
          subject: peerData.subject,
          userScore: userData.averageScore,
          peerScore: peerData.averageScore,
          difference: userData.averageScore - peerData.averageScore,
          percentile: calculatePercentile(userData.averageScore, peerData.averageScore)
        });
      }
    }

    res.status(200).json({
      comparisonData,
      userPerformance,
      averagePeerPerformance: peerPerformance
    });
  } catch (error: any) {
    console.error('Peer comparison error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to calculate percentile (simplified)
const calculatePercentile = (userScore: number, averageScore: number): number => {
  if (userScore >= averageScore) {
    // If user score is above average, assume they're in the top 50%
    const percentileAbove50 = 50 + (userScore - averageScore) / 2; // Simplified calculation
    return Math.min(99, Math.round(percentileAbove50)); // Cap at 99th percentile
  } else {
    // If user score is below average, assume they're in the bottom 50%
    const percentileBelow50 = 50 - (averageScore - userScore) / 2; // Simplified calculation
    return Math.max(1, Math.round(percentileBelow50)); // Minimum 1st percentile
  }
};

// Get time analytics (time spent per question type)
export const getTimeAnalytics = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get exam attempts for time analysis
    const examAttempts = await ExamAttempt.find({ 
      userId, 
      completed: true 
    }).populate('answers.questionId');

    // Calculate study time distribution
    const timeBySubject: Record<string, number> = {};
    const timeByFormat: Record<string, number> = {};
    const timeByDifficulty: Record<string, number> = {};
    
    let totalTimeSpent = 0;
    let totalQuestionsAttempted = 0;

    for (const attempt of examAttempts) {
      for (const answer of attempt.answers) {
        const questionId = answer.questionId;
        const timeSpent = answer.timeSpent || 0;
        
        // Skip if no time spent
        if (timeSpent <= 0) continue;
        
        totalTimeSpent += timeSpent;
        totalQuestionsAttempted++;
        
        // This requires questionId to be populated with the actual question data
        if (typeof questionId === 'object' && questionId !== null) {
          const question = questionId as any;
          
          // Add time by subject
          if (question.subject) {
            if (!timeBySubject[question.subject]) {
              timeBySubject[question.subject] = 0;
            }
            timeBySubject[question.subject] += timeSpent;
          }
          
          // Add time by format
          if (question.format) {
            if (!timeByFormat[question.format]) {
              timeByFormat[question.format] = 0;
            }
            timeByFormat[question.format] += timeSpent;
          }
          
          // Add time by difficulty
          if (question.difficulty) {
            if (!timeByDifficulty[question.difficulty]) {
              timeByDifficulty[question.difficulty] = 0;
            }
            timeByDifficulty[question.difficulty] += timeSpent;
          }
        }
      }
    }

    // Convert raw seconds into structured time data
    const formatTimeData = (timeMap: Record<string, number>) => {
      return Object.entries(timeMap).map(([key, seconds]) => ({
        category: key,
        timeSpentSeconds: seconds,
        timeSpentMinutes: Math.round(seconds / 60),
        percentageOfTotal: totalTimeSpent > 0 ? Math.round((seconds / totalTimeSpent) * 100) : 0
      }));
    };

    res.status(200).json({
      totalTimeSpentSeconds: totalTimeSpent,
      totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
      totalQuestionsAttempted,
      averageTimePerQuestionSeconds: totalQuestionsAttempted > 0 ? Math.round(totalTimeSpent / totalQuestionsAttempted) : 0,
      timeBySubject: formatTimeData(timeBySubject),
      timeByFormat: formatTimeData(timeByFormat),
      timeByDifficulty: formatTimeData(timeByDifficulty)
    });
  } catch (error: any) {
    console.error('Time analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 