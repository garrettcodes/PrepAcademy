import { Request, Response } from 'express';
import Onboarding from '../models/onboarding.model';
import User from '../models/user.model';

// Initialize onboarding for a new user
export const initializeOnboarding = async (userId: string) => {
  try {
    // Check if onboarding already exists
    const existingOnboarding = await Onboarding.findOne({ user: userId });
    
    if (existingOnboarding) {
      return existingOnboarding;
    }
    
    // Create new onboarding record
    const onboarding = new Onboarding({
      user: userId,
    });
    
    await onboarding.save();
    return onboarding;
  } catch (error) {
    console.error('Error initializing onboarding:', error);
    throw error;
  }
};

// Get onboarding status
export const getOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Find or create onboarding record
    let onboarding = await Onboarding.findOne({ user: userId });
    
    if (!onboarding) {
      onboarding = await initializeOnboarding(userId);
    }
    
    res.status(200).json({ 
      onboarding,
      isCompleted: onboarding.isCompleted 
    });
  } catch (error: any) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update onboarding step
export const updateOnboardingStep = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { step } = req.params;
    const { completed } = req.body;
    
    // Validate step
    const validSteps = ['welcomeIntro', 'diagnosticTest', 'studyPlan', 'practiceExams', 'appNavigation', 'progressTracking'];
    
    if (!validSteps.includes(step)) {
      return res.status(400).json({ message: 'Invalid onboarding step' });
    }
    
    // Find or create onboarding record
    let onboarding = await Onboarding.findOne({ user: userId });
    
    if (!onboarding) {
      onboarding = await initializeOnboarding(userId);
    }
    
    // Update step
    onboarding.steps[step as keyof typeof onboarding.steps] = completed;
    onboarding.lastStepCompletedAt = new Date();
    
    // Check if all steps are completed
    const allStepsCompleted = validSteps.every(
      (s) => onboarding.steps[s as keyof typeof onboarding.steps]
    );
    
    if (allStepsCompleted && !onboarding.isCompleted) {
      onboarding.isCompleted = true;
      onboarding.completedAt = new Date();
      
      // Reward the user with points for completing onboarding
      await User.findByIdAndUpdate(userId, { $inc: { points: 50 } });
    }
    
    await onboarding.save();
    
    res.status(200).json({ 
      message: 'Onboarding step updated',
      onboarding,
      isCompleted: onboarding.isCompleted 
    });
  } catch (error: any) {
    console.error('Update onboarding step error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Skip onboarding
export const skipOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Find or create onboarding record
    let onboarding = await Onboarding.findOne({ user: userId });
    
    if (!onboarding) {
      onboarding = await initializeOnboarding(userId);
    }
    
    // Mark as completed without completing all steps
    onboarding.isCompleted = true;
    onboarding.completedAt = new Date();
    
    await onboarding.save();
    
    res.status(200).json({ 
      message: 'Onboarding skipped',
      onboarding 
    });
  } catch (error: any) {
    console.error('Skip onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset onboarding
export const resetOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Find onboarding record
    const onboarding = await Onboarding.findOne({ user: userId });
    
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }
    
    // Reset all steps
    for (const step in onboarding.steps) {
      onboarding.steps[step as keyof typeof onboarding.steps] = false;
    }
    
    onboarding.isCompleted = false;
    onboarding.completedAt = undefined;
    
    await onboarding.save();
    
    res.status(200).json({ 
      message: 'Onboarding reset',
      onboarding 
    });
  } catch (error: any) {
    console.error('Reset onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 