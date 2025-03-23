import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import User from '../models/user.model';
import Question from '../models/question.model';
import PerformanceData from '../models/performanceData.model';
import { detectLearningStyle, getLearningStyleRecommendations } from '../utils/learningStyleDetector';
import { generateStudyPlan } from '../utils/studyPlanGenerator';

/**
 * Get the status of the user's mini-assessment
 * Returns whether an assessment is due and when the next one is scheduled
 */
export const getMiniAssessmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const nextAssessmentDate = user.nextMiniAssessmentDate || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isDue = nextAssessmentDate <= now;

    res.status(200).json({
      isDue,
      nextAssessmentDate,
      daysTillNext: isDue ? 0 : Math.ceil((nextAssessmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    });
  } catch (error: any) {
    console.error('Get mini-assessment status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get mini-assessment questions
 * Returns a set of questions for the mini-assessment in various formats
 * to re-evaluate the user's learning style
 */
export const getMiniAssessmentQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user to check if mini-assessment is due
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const nextAssessmentDate = user.nextMiniAssessmentDate;
    
    // If mini-assessment is not due yet, return an error
    if (nextAssessmentDate && nextAssessmentDate > now) {
      return res.status(400).json({ 
        message: 'Mini-assessment is not due yet',
        nextAssessmentDate,
        daysTillNext: Math.ceil((nextAssessmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
    }

    // Get a balanced set of questions in different formats
    const formats = ['text', 'diagram', 'audio', 'video', 'interactive'];
    const questions: any[] = [];

    // Get 3 questions for each format, total of 15 questions
    for (const format of formats) {
      const formatQuestions = await Question.aggregate([
        { $match: { format } },
        { $sample: { size: 3 } }
      ]);
      
      questions.push(...formatQuestions);
    }

    res.status(200).json({
      questions
    });
  } catch (error: any) {
    console.error('Get mini-assessment questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Submit mini-assessment answers
 * Processes the answers, updates the user's learning style if needed,
 * and schedules the next mini-assessment
 */
export const submitMiniAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Calculate score and analyze results
    const formatScores: Record<string, { correct: number; total: number }> = {};
    const subjectScores: Record<string, { correct: number; total: number }> = {};

    // Initialize format scores for all standard formats
    const standardFormats = ['text', 'diagram', 'audio', 'video', 'interactive'];
    standardFormats.forEach(format => {
      formatScores[format] = { correct: 0, total: 0 };
    });

    // Process each answer
    for (const answer of answers) {
      const { questionId, selectedAnswer } = answer;
      
      // Get the question
      const question = await Question.findById(questionId);
      if (!question) continue;

      // Check if answer is correct
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      // Update subject scores
      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      
      if (isCorrect) {
        subjectScores[question.subject].correct += 1;
      }
      subjectScores[question.subject].total += 1;

      // Update format scores
      if (!formatScores[question.format]) {
        formatScores[question.format] = { correct: 0, total: 0 };
      }
      
      if (isCorrect) {
        formatScores[question.format].correct += 1;
      }
      formatScores[question.format].total += 1;

      // Save performance data
      await PerformanceData.create({
        userId,
        subject: question.subject,
        subtopic: 'Mini-Assessment',
        score: isCorrect ? 100 : 0,
        studyTime: 0,
        date: new Date(),
      });
    }

    // Determine learning style based on format performance
    const detectedLearningStyle = detectLearningStyle(formatScores);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if learning style has changed
    const learningStyleChanged = user.learningStyle !== detectedLearningStyle;
    
    // Get learning style-specific recommendations
    const styleRecommendations = getLearningStyleRecommendations(detectedLearningStyle);

    // Calculate next mini-assessment date (2 weeks from now)
    const nextMiniAssessmentDate = new Date();
    nextMiniAssessmentDate.setDate(nextMiniAssessmentDate.getDate() + 14);

    // Update user's learning style and next mini-assessment date
    await User.findByIdAndUpdate(userId, {
      learningStyle: detectedLearningStyle,
      nextMiniAssessmentDate
    });

    // If learning style changed, update study plan recommendations
    if (learningStyleChanged) {
      // Generate new study plan based on updated learning style
      const { dailyGoals, weeklyGoals } = generateStudyPlan(subjectScores, detectedLearningStyle);
      
      // Update the study plan with new recommendations
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'studyPlan.learningStyleRecommendations': styleRecommendations,
            'studyPlan.dailyGoals': dailyGoals,
            'studyPlan.weeklyGoals': weeklyGoals
          }
        }
      );
    }

    // Return assessment results
    res.status(200).json({
      learningStyle: detectedLearningStyle,
      previousLearningStyle: user.learningStyle,
      learningStyleChanged,
      formatScores,
      nextMiniAssessmentDate,
      recommendations: styleRecommendations
    });
  } catch (error: any) {
    console.error('Submit mini-assessment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check for due mini-assessments and send notifications
 * This is intended to be called by a scheduled job/cron task
 */
export const checkAndNotifyDueMiniAssessments = async () => {
  try {
    // Find users with due mini-assessments
    const now = new Date();
    const users = await User.find({
      nextMiniAssessmentDate: { $lte: now }
    });

    console.log(`Found ${users.length} users with due mini-assessments`);

    for (const user of users) {
      // This is where you would integrate with an email service
      // For now, we'll just log a message
      console.log(`Mini-assessment due for user: ${user.email}`);
      
      // Here you would send an email or in-app notification
      // sendNotification(user.email, 'Mini-Assessment Due', 'Your periodic learning style assessment is now due.');
    }

    return users.length;
  } catch (error) {
    console.error('Check and notify due mini-assessments error:', error);
    return 0;
  }
};

/**
 * Manual endpoint to trigger notifications for due mini-assessments
 * For testing or manual triggering
 */
export const triggerMiniAssessmentNotifications = async (_req: Request, res: Response) => {
  try {
    const count = await checkAndNotifyDueMiniAssessments();
    res.status(200).json({ 
      message: `Notifications sent for ${count} users with due mini-assessments` 
    });
  } catch (error: any) {
    console.error('Trigger mini-assessment notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 