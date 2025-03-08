import { Request, Response } from 'express';
import StudyPlan from '../models/studyPlan.model';
import User from '../models/user.model';
import PerformanceData from '../models/performanceData.model';

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// Get the user's study plan
export const getStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const studyPlan = await StudyPlan.findOne({ userId });
    
    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Calculate progress based on completed tasks
    const totalTasks = studyPlan.dailyGoals.length + studyPlan.weeklyGoals.length;
    const completedTasks = 
      studyPlan.dailyGoals.filter(goal => goal.status === 'completed').length +
      studyPlan.weeklyGoals.filter(goal => goal.status === 'completed').length;
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Update the progress if it's changed
    if (progress !== studyPlan.progress) {
      studyPlan.progress = progress;
      await studyPlan.save();
    }

    res.status(200).json(studyPlan);
  } catch (error: any) {
    console.error('Get study plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task status in the study plan
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId, taskType, status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!taskId || !taskType || !status) {
      return res.status(400).json({ 
        message: 'Missing required fields. Please provide taskId, taskType, and status' 
      });
    }

    // Validate task type
    if (taskType !== 'daily' && taskType !== 'weekly') {
      return res.status(400).json({ 
        message: 'Invalid task type. Must be either "daily" or "weekly"' 
      });
    }

    // Validate status
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: pending, in-progress, completed' 
      });
    }

    // Find the user's study plan
    const studyPlan = await StudyPlan.findOne({ userId });
    
    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update the task status
    let taskUpdated = false;
    
    if (taskType === 'daily') {
      // Find and update the daily goal
      const goalIndex = studyPlan.dailyGoals.findIndex(
        goal => goal._id.toString() === taskId
      );
      
      if (goalIndex !== -1) {
        studyPlan.dailyGoals[goalIndex].status = status;
        taskUpdated = true;
      }
    } else {
      // Find and update the weekly goal
      const goalIndex = studyPlan.weeklyGoals.findIndex(
        goal => goal._id.toString() === taskId
      );
      
      if (goalIndex !== -1) {
        studyPlan.weeklyGoals[goalIndex].status = status;
        taskUpdated = true;
      }
    }

    if (!taskUpdated) {
      return res.status(404).json({ message: 'Task not found in study plan' });
    }

    // Calculate updated progress
    const totalTasks = studyPlan.dailyGoals.length + studyPlan.weeklyGoals.length;
    const completedTasks = 
      studyPlan.dailyGoals.filter(goal => goal.status === 'completed').length +
      studyPlan.weeklyGoals.filter(goal => goal.status === 'completed').length;
    
    studyPlan.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Save the updated study plan
    await studyPlan.save();

    res.status(200).json({
      message: 'Task status updated successfully',
      studyPlan
    });
  } catch (error: any) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate a new study plan
export const generateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the user to get their learning style
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For now, redirect the user to take the diagnostic test
    // In a real application, you might implement custom study plan generation here
    return res.status(200).json({
      message: 'To generate a personalized study plan, please take the diagnostic test',
      redirectTo: '/diagnostic'
    });

  } catch (error: any) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update study plan
export const updateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { 
      dailyGoals, 
      weeklyGoals, 
      recommendations, 
      completedTopics 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the user's study plan
    const studyPlan = await StudyPlan.findOne({ userId });
    
    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update only the fields that are provided
    if (dailyGoals) studyPlan.dailyGoals = dailyGoals;
    if (weeklyGoals) studyPlan.weeklyGoals = weeklyGoals;
    if (recommendations) studyPlan.recommendations = recommendations;
    if (completedTopics) studyPlan.completedTopics = completedTopics;

    // Calculate updated progress
    const totalTasks = studyPlan.dailyGoals.length + studyPlan.weeklyGoals.length;
    const completedTasks = 
      studyPlan.dailyGoals.filter(goal => goal.status === 'completed').length +
      studyPlan.weeklyGoals.filter(goal => goal.status === 'completed').length;
    
    studyPlan.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Save the updated study plan
    await studyPlan.save();

    res.status(200).json({
      message: 'Study plan updated successfully',
      studyPlan
    });
  } catch (error: any) {
    console.error('Update study plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate adaptive study plan based on performance
export const generateAdaptiveStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    // Get user's performance data
    const performanceData = await PerformanceData.find({ userId }).sort({ date: -1 });
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate performance by subject
    const subjectPerformance: Record<string, { score: number; count: number }> = {};
    
    performanceData.forEach((data) => {
      if (!subjectPerformance[data.subject]) {
        subjectPerformance[data.subject] = { score: 0, count: 0 };
      }
      
      subjectPerformance[data.subject].score += data.score;
      subjectPerformance[data.subject].count += 1;
    });

    // Calculate average score per subject
    const subjectAverages: Record<string, number> = {};
    
    Object.entries(subjectPerformance).forEach(([subject, { score, count }]) => {
      subjectAverages[subject] = count > 0 ? score / count : 0;
    });

    // Identify weak areas (subjects with average score < 70%)
    const weakAreas = Object.entries(subjectAverages)
      .filter(([_, average]) => average < 70)
      .map(([subject]) => subject);

    // Generate daily and weekly goals based on weak areas and learning style
    const dailyGoals = [];
    const weeklyGoals = [];

    // Add more practice for weak areas
    weakAreas.forEach((subject) => {
      dailyGoals.push({
        task: `Practice 30 ${subject} questions`,
        status: 'pending',
      });
      
      // Add learning style specific tasks
      if (user.learningStyle === 'visual') {
        weeklyGoals.push({
          task: `Watch 3 ${subject} video tutorials`,
          status: 'pending',
        });
      } else if (user.learningStyle === 'auditory') {
        weeklyGoals.push({
          task: `Listen to 2 ${subject} audio lessons`,
          status: 'pending',
        });
      } else if (user.learningStyle === 'kinesthetic') {
        weeklyGoals.push({
          task: `Complete 2 interactive ${subject} exercises`,
          status: 'pending',
        });
      } else {
        weeklyGoals.push({
          task: `Read 2 ${subject} study guides`,
          status: 'pending',
        });
      }
    });

    // Add maintenance for strong areas
    Object.keys(subjectAverages)
      .filter((subject) => !weakAreas.includes(subject))
      .forEach((subject) => {
        dailyGoals.push({
          task: `Practice 10 ${subject} questions`,
          status: 'pending',
        });
      });

    // Add general test preparation
    weeklyGoals.push({
      task: 'Complete 1 full practice exam',
      status: 'pending',
    });

    // Update or create study plan
    const existingPlan = await StudyPlan.findOne({ userId });
    
    let studyPlan;
    if (existingPlan) {
      studyPlan = await StudyPlan.findByIdAndUpdate(
        existingPlan._id,
        {
          dailyGoals,
          weeklyGoals,
          progress: 0,
        },
        { new: true }
      );
    } else {
      studyPlan = await StudyPlan.create({
        userId,
        dailyGoals,
        weeklyGoals,
        progress: 0,
      });

      // Link study plan to user
      await User.findByIdAndUpdate(userId, { studyPlan: studyPlan._id });
    }

    res.status(200).json({
      studyPlan,
      weakAreas,
      subjectAverages,
    });
  } catch (error: any) {
    console.error('Generate adaptive study plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 