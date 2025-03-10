import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/user.model';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Add user to request
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Authorization middleware
export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists in request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authorized, no user data' });
    }

    try {
      // Get full user data with role
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has required role
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied: requires ${roles.join(' or ')} role` 
        });
      }

      // Add full user data to request
      req.user = {
        ...req.user,
        role: user.role,
        expertise: user.expertise || []
      };

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};

// Expert authorization with subject expertise check
export const authorizeExpertise = (subject: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists in request and is an expert
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authorized, no user data' });
    }

    try {
      // Get full user data
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is an expert and has expertise in the subject or 'All'
      if (user.role !== 'expert' && user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: requires expert or admin role' });
      }

      if (user.role === 'expert' && 
          user.expertise && 
          !user.expertise.includes(subject) && 
          !user.expertise.includes('All')) {
        return res.status(403).json({ 
          message: `Access denied: requires expertise in ${subject}` 
        });
      }

      // Add full user data to request
      req.user = {
        ...req.user,
        role: user.role,
        expertise: user.expertise || []
      };

      next();
    } catch (error) {
      console.error('Expert authorization error:', error);
      res.status(500).json({ message: 'Server error during expert authorization' });
    }
  };
};

// Admin middleware (shorthand for authorize('admin'))
export const admin = authorize('admin');

// Expert middleware (shorthand for authorize('expert', 'admin'))
export const expert = authorize('expert', 'admin'); 