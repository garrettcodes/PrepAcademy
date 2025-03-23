import { Request, Response } from 'express';
import User from '../models/user.model';
import Parent from '../models/parent.model';
import PerformanceData from '../models/performanceData.model';
import ExamAttempt from '../models/examAttempt.model';
import mongoose from 'mongoose';

// Generate a comprehensive progress report for a student
export const generateProgressReport = async (req: Request, res: Response) => {
  try {
    const parentId = req.user?.userId;
    if (!parentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { studentId } = req.params;
    const { timeframe } = req.query; // 'week', 'month', 'all'

    // Check if parent has access to this student
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Convert studentId to ObjectId for proper comparison
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Check if student is linked to this parent
    if (!parent.students.some(id => id.equals(studentObjectId))) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s data' });
    }

    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get date range based on timeframe
    let dateFilter = {};
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      if (timeframe !== 'all') {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // Get performance data
    const performanceData = await PerformanceData.find({
      _id: { $in: student.performanceData },
      ...dateFilter
    }).sort({ createdAt: -1 });

    // Get exam attempts
    const examAttempts = await ExamAttempt.find({
      user: studentId,
      ...dateFilter
    }).populate('exam').sort({ createdAt: -1 });

    // Calculate statistics
    const statistics = calculateStatistics(performanceData, examAttempts);

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        targetScore: student.targetScore,
        testDate: student.testDate
      },
      timeframe: timeframe || 'all',
      statistics,
      performanceData,
      examAttempts
    });
  } catch (error: any) {
    console.error('Generate progress report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate a study time report for a student
export const generateStudyTimeReport = async (req: Request, res: Response) => {
  try {
    const parentId = req.user?.userId;
    if (!parentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { studentId } = req.params;
    const { timeframe } = req.query; // 'week', 'month', 'all'

    // Find parent and check authorization
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Convert studentId to ObjectId for proper comparison
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Check if student is linked to this parent
    if (!parent.students.some(id => id.equals(studentObjectId))) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s data' });
    }

    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get date range based on timeframe
    let dateFilter = {};
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      if (timeframe !== 'all') {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // Get performance data with study time
    const performanceData = await PerformanceData.find({
      _id: { $in: student.performanceData },
      ...dateFilter
    }).sort({ createdAt: -1 });

    // Calculate study time statistics
    const studyTimeStats = calculateStudyTimeStats(performanceData);

    // Group study time by day
    const dailyStudyTime = groupStudyTimeByDay(performanceData);

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      },
      timeframe: timeframe || 'all',
      studyTimeStats,
      dailyStudyTime
    });
  } catch (error: any) {
    console.error('Generate study time report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate a task completion report for a student
export const generateTaskCompletionReport = async (req: Request, res: Response) => {
  try {
    const parentId = req.user?.userId;
    if (!parentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { studentId } = req.params;
    const { timeframe } = req.query; // 'week', 'month', 'all'

    // Check if parent has access to this student
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Convert studentId to ObjectId for proper comparison
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Check if student is linked to this parent
    if (!parent.students.some(id => id.equals(studentObjectId))) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s data' });
    }

    // Find the student and populate study plan
    const student = await User.findById(studentId).populate('studyPlan');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get date range based on timeframe
    let dateFilter = {};
    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      if (timeframe !== 'all') {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // Get exam attempts to track completed exercises
    const examAttempts = await ExamAttempt.find({
      user: studentId,
      ...dateFilter
    }).populate('exam').sort({ createdAt: -1 });

    // Calculate task completion statistics
    const taskStats = calculateTaskCompletionStats(student.studyPlan, examAttempts);

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      },
      timeframe: timeframe || 'all',
      taskStats,
      studyPlan: student.studyPlan,
      completedExams: examAttempts
    });
  } catch (error: any) {
    console.error('Generate task completion report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to calculate performance statistics
const calculateStatistics = (performanceData: any[], examAttempts: any[]) => {
  // Define types for stats object
  interface ExamScore {
    examName: string;
    score: number;
    date: Date;
  }
  
  interface SubjectPerformance {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
  }

  // Initial statistics object
  const stats = {
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    totalStudyTimeMinutes: 0,
    examScores: [] as ExamScore[],
    subjectPerformance: {} as Record<string, SubjectPerformance>
  };

  // Process exam attempts
  if (examAttempts.length > 0) {
    let totalScore = 0;
    
    examAttempts.forEach(attempt => {
      const score = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
      
      totalScore += score;
      stats.totalQuestionsAnswered += attempt.totalQuestions;
      stats.correctAnswers += attempt.correctAnswers;
      stats.incorrectAnswers += (attempt.totalQuestions - attempt.correctAnswers);
      
      stats.examScores.push({
        examName: attempt.exam.title,
        score,
        date: attempt.createdAt
      });
      
      // Track subject performance
      const subject = attempt.exam.subject || 'General';
      if (!stats.subjectPerformance[subject]) {
        stats.subjectPerformance[subject] = {
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0
        };
      }
      
      stats.subjectPerformance[subject].totalQuestions += attempt.totalQuestions;
      stats.subjectPerformance[subject].correctAnswers += attempt.correctAnswers;
    });
    
    stats.averageScore = Math.round(totalScore / examAttempts.length);
    stats.highestScore = Math.max(...stats.examScores.map(s => s.score));
    stats.lowestScore = Math.min(...stats.examScores.map(s => s.score));
  }
  
  // Calculate accuracy
  if (stats.totalQuestionsAnswered > 0) {
    stats.accuracy = Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100);
  }
  
  // Calculate subject-specific accuracy
  Object.keys(stats.subjectPerformance).forEach(subject => {
    const subjectData = stats.subjectPerformance[subject];
    if (subjectData.totalQuestions > 0) {
      subjectData.accuracy = Math.round((subjectData.correctAnswers / subjectData.totalQuestions) * 100);
    }
  });
  
  // Process performance data for study time
  if (performanceData.length > 0) {
    performanceData.forEach(data => {
      if (data.studyTimeMinutes) {
        stats.totalStudyTimeMinutes += data.studyTimeMinutes;
      }
    });
  }
  
  return stats;
};

// Helper function to calculate study time statistics
const calculateStudyTimeStats = (performanceData: any[]) => {
  interface ProductiveDay {
    date: string;
    studyTimeMinutes: number;
  }
  
  // Initial stats object
  const stats = {
    totalStudyTimeMinutes: 0,
    averageDailyStudyTimeMinutes: 0,
    mostStudyTimeDay: "",
    leastStudyTimeDay: "",
    studyTimeByDay: {} as Record<string, number>,
    studyTimeBySubject: {} as Record<string, number>,
    mostProductiveDay: null as ProductiveDay | null
  };
  
  if (performanceData.length === 0) {
    return stats;
  }
  
  // Calculate total study time
  performanceData.forEach(data => {
    if (data.studyTimeMinutes) {
      stats.totalStudyTimeMinutes += data.studyTimeMinutes;
      
      // Track study time by subject
      const subject = data.subject || 'General';
      if (!stats.studyTimeBySubject[subject]) {
        stats.studyTimeBySubject[subject] = 0;
      }
      stats.studyTimeBySubject[subject] += data.studyTimeMinutes;
    }
  });
  
  // Calculate average daily study time
  const uniqueDays = new Set(
    performanceData.map(data => 
      new Date(data.createdAt).toISOString().split('T')[0]
    )
  );
  
  if (uniqueDays.size > 0) {
    stats.averageDailyStudyTimeMinutes = Math.round(stats.totalStudyTimeMinutes / uniqueDays.size);
  }
  
  // Time is cast as number for type safety
  const dayMap: Record<string, number> = {};
  
  performanceData.forEach(data => {
    const day = new Date(data.createdAt).toISOString().split('T')[0];
    if (!dayMap[day]) {
      dayMap[day] = 0;
    }
    dayMap[day] += data.studyTimeMinutes || 0;
  });
  
  let maxStudyTime = 0;
  Object.entries(dayMap).forEach(([day, time]) => {
    // Ensure time is treated as a number
    const timeValue = time as number;
    if (timeValue > maxStudyTime) {
      maxStudyTime = timeValue;
      stats.mostProductiveDay = {
        date: day,
        studyTimeMinutes: timeValue
      };
    }
  });
  
  return stats;
};

// Helper function to group study time by day
const groupStudyTimeByDay = (performanceData: any[]) => {
  const dailyData = {};
  
  performanceData.forEach(data => {
    if (data.studyTimeMinutes) {
      const day = new Date(data.createdAt).toISOString().split('T')[0];
      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          totalMinutes: 0,
          subjects: {}
        };
      }
      
      dailyData[day].totalMinutes += data.studyTimeMinutes;
      
      // Track by subject
      const subject = data.subject || 'General';
      if (!dailyData[day].subjects[subject]) {
        dailyData[day].subjects[subject] = 0;
      }
      dailyData[day].subjects[subject] += data.studyTimeMinutes;
    }
  });
  
  // Convert to array and sort by date
  return Object.values(dailyData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Helper function to calculate task completion statistics
const calculateTaskCompletionStats = (studyPlan: any, examAttempts: any[]) => {
  interface UpcomingTask {
    task: string;
    week: number;
    day: number;
    subject: string;
  }
  
  interface CompletedTask {
    task: string;
    score: number;
    date: Date;
    subject: string;
  }
  
  // Initial stats object
  const stats = {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    upcomingTasks: [] as UpcomingTask[],
    recentlyCompletedTasks: [] as CompletedTask[]
  };
  
  if (!studyPlan) {
    return stats;
  }
  
  // Count tasks in study plan
  let totalTasks = 0;
  let completedTasks = 0;
  const upcomingTasks: UpcomingTask[] = [];
  
  // Process weeks in study plan
  if (studyPlan.weeks && studyPlan.weeks.length > 0) {
    studyPlan.weeks.forEach(week => {
      if (week.days && week.days.length > 0) {
        week.days.forEach(day => {
          if (day.tasks && day.tasks.length > 0) {
            day.tasks.forEach(task => {
              totalTasks++;
              
              if (task.completed) {
                completedTasks++;
              } else {
                // Add to upcoming tasks if not completed
                upcomingTasks.push({
                  task: task.description,
                  week: week.weekNumber,
                  day: day.dayOfWeek,
                  subject: task.subject || 'General'
                });
              }
            });
          }
        });
      }
    });
  }
  
  stats.totalTasks = totalTasks;
  stats.completedTasks = completedTasks;
  stats.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Sort upcoming tasks and limit to 5
  stats.upcomingTasks = upcomingTasks
    .sort((a, b) => (a.week - b.week) || (a.day - b.day))
    .slice(0, 5);
  
  // Add recently completed exams as tasks
  stats.recentlyCompletedTasks = examAttempts
    .slice(0, 5)
    .map(attempt => ({
      task: `Completed ${attempt.exam.title} exam`,
      score: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
      date: attempt.createdAt,
      subject: attempt.exam.subject || 'General'
    }));
  
  return stats;
}; 