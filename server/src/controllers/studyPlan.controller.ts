import { Request, Response } from 'express';
import StudyPlan from '../models/studyPlan.model';
import User from '../models/user.model';
import PerformanceData from '../models/performanceData.model';

// Get user's study plan
export const getStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    // Find study plan for user
    const studyPlan = await StudyPlan.findOne({ userId });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.status(200).json(studyPlan);
  } catch (error: any) {
    console.error('Get study plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update study plan
export const updateStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { dailyGoals, weeklyGoals, progress } = req.body;

    // Find study plan for user
    const studyPlan = await StudyPlan.findOne({ userId });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update study plan
    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      studyPlan._id,
      {
        dailyGoals: dailyGoals || studyPlan.dailyGoals,
        weeklyGoals: weeklyGoals || studyPlan.weeklyGoals,
        progress: progress !== undefined ? progress : studyPlan.progress,
      },
      { new: true }
    );

    res.status(200).json(updatedPlan);
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