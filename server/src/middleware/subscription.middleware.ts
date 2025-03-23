import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

// Middleware to check if user has active subscription (trials excluded)
export const checkSubscriptionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active subscription - explicitly exclude trial users
    if (user.subscriptionStatus === 'active') {
      return next();
    }

    // Create different messages for trial users vs. non-subscribers
    let message = 'Premium feature - subscription required';
    if (user.subscriptionStatus === 'trial') {
      message = 'This premium feature is not available during your free trial';
    }

    // User doesn't have an active subscription
    return res.status(403).json({
      message,
      subscriptionRequired: true,
      status: user.subscriptionStatus
    });
  } catch (error: unknown) {
    console.error('Error in subscription middleware:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Middleware to check if user's trial is still valid
// This middleware can be used for features that ARE available during trial
export const checkTrialMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is in trial period or has active subscription
    if (user.subscriptionStatus === 'trial') {
      const now = new Date();
      const trialEndDate = user.trialEndDate ? new Date(user.trialEndDate) : null;
      
      if (trialEndDate && now < trialEndDate) {
        req.trialDaysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return next();
      } else {
        // Trial has expired, update user status
        user.subscriptionStatus = 'expired';
        await user.save();
        
        return res.status(403).json({
          message: 'Trial period has expired - subscription required',
          subscriptionRequired: true,
          status: 'expired'
        });
      }
    } else if (user.subscriptionStatus === 'active') {
      // User has active subscription, pass through
      return next();
    }

    // User doesn't have an active subscription or trial
    return res.status(403).json({
      message: 'Feature requires trial or subscription',
      subscriptionRequired: true,
      status: user.subscriptionStatus
    });
  } catch (error: unknown) {
    console.error('Error in trial middleware:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Extend Request interface to include trialDaysLeft
declare global {
  namespace Express {
    interface Request {
      trialDaysLeft?: number;
    }
  }
} 