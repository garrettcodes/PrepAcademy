import { Request, Response } from 'express';
import User from '../models/user.model';
import PerformanceData from '../models/performanceData.model';
import Question from '../models/question.model';
import { updateChallengeProgress } from './challenge.controller';
import { updateOnboardingStep, skipOnboarding } from './onboarding.controller';

// Sync offline progress
export const syncOfflineProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { actions } = req.body;
    
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ message: 'No actions to sync' });
    }
    
    // Sort actions by timestamp to process them in order
    const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp);
    
    const results = {
      processed: 0,
      failed: 0,
      details: [] as any[],
    };
    
    // Process each action
    for (const action of sortedActions) {
      try {
        const { type, data, timestamp } = action;
        
        switch (type) {
          case 'ANSWER_QUESTION':
            await processAnswerQuestion(userId, data);
            break;
            
          case 'COMPLETE_STUDY_MATERIAL':
            await processCompleteStudyMaterial(userId, data);
            break;
            
          case 'UPDATE_STUDY_TIME':
            await processUpdateStudyTime(userId, data);
            break;
            
          case 'COMPLETE_ONBOARDING_STEP':
            await processCompleteOnboardingStep(userId, data);
            break;
            
          case 'SKIP_ONBOARDING':
            await processSkipOnboarding(userId);
            break;
            
          default:
            throw new Error(`Unknown action type: ${type}`);
        }
        
        results.processed++;
        results.details.push({
          action: type,
          status: 'success',
          timestamp,
        });
      } catch (error: any) {
        results.failed++;
        results.details.push({
          action: action.type,
          status: 'failed',
          error: error.message,
          timestamp: action.timestamp,
        });
      }
    }
    
    res.status(200).json({
      message: 'Sync complete',
      results,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process answer question action
async function processAnswerQuestion(userId: string, data: any) {
  const { questionId, isCorrect, timeSpent } = data;
  
  // Validate question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }
  
  // Update performance data
  await PerformanceData.create({
    user: userId,
    question: questionId,
    isCorrect,
    timeSpent,
    category: question.category,
    difficulty: question.difficulty,
  });
  
  // Update challenge progress if applicable
  await updateChallengeProgress(userId, 'questions', 1);
  
  // Update user points
  const pointsToAdd = isCorrect ? 5 : 1;
  await User.findByIdAndUpdate(userId, { $inc: { points: pointsToAdd } });
}

// Process complete study material action
async function processCompleteStudyMaterial(userId: string, data: any) {
  const { materialId, timeSpent } = data;
  
  // Update user's study plan
  await User.findOneAndUpdate(
    { _id: userId, 'studyPlan.materials._id': materialId },
    { 
      $set: { 'studyPlan.materials.$.completed': true },
      $inc: { 'studyPlan.materials.$.timeSpent': timeSpent }
    }
  );
  
  // Update challenge progress if applicable
  await updateChallengeProgress(userId, 'studyTime', Math.floor(timeSpent / 60));
}

// Process update study time action
async function processUpdateStudyTime(userId: string, data: any) {
  const { duration, category } = data;
  
  // Convert duration to minutes
  const durationInMinutes = Math.floor(duration / 60);
  
  // Update performance data with study time
  await PerformanceData.create({
    user: userId,
    studyTime: durationInMinutes,
    category: category || 'general',
  });
  
  // Update challenge progress
  await updateChallengeProgress(userId, 'studyTime', durationInMinutes);
}

// Process complete onboarding step action
async function processCompleteOnboardingStep(userId: string, data: any) {
  const { stepId } = data;
  if (!stepId) {
    throw new Error('Step ID is required for completing onboarding step');
  }

  // Create a mock request/response for the controller
  const mockReq = {
    user: { userId },
    params: { step: stepId },
    body: { completed: true }
  } as unknown as Request;
  
  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => data
    })
  } as unknown as Response;

  await updateOnboardingStep(mockReq, mockRes);
}

// Process skip onboarding action
async function processSkipOnboarding(userId: string) {
  // Create a mock request/response for the controller
  const mockReq = {
    user: { userId }
  } as unknown as Request;
  
  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => data
    })
  } as unknown as Response;

  await skipOnboarding(mockReq, mockRes);
} 