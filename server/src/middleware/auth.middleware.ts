import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/user.model';

// Define the JWT payload interface
interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  userType?: 'student' | 'parent';
  role?: string;
  expertise?: string[];
  tokenType?: string;
  _id?: string; // Add _id as alias for userId for backward compatibility
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
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
      const decoded = verifyToken(token) as JWTPayload;

      // Add user to request
      req.user = decoded;
      
      // Set _id equal to userId for backward compatibility
      if (req.user && req.user.userId) {
        req.user._id = req.user.userId;
      }

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

// Middleware to set secure cookie options
export const secureCookieSettings = (req: Request, res: Response, next: NextFunction) => {
  // Set secure cookie defaults
  res.cookie = (name: string, value: string, options = {}) => {
    const secureOptions = {
      httpOnly: true, // Prevents JavaScript from reading cookie
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict' as const, // Prevents CSRF attacks
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      ...options
    };
    
    // Call the original cookie function with secure defaults
    return (res as any).cookie(name, value, secureOptions);
  };
  
  next();
};

// Content Security Policy middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate a CSRF token for each request if it doesn't exist
  if (!req.headers['x-csrf-token']) {
    const csrfToken = require('crypto').randomBytes(16).toString('hex');
    res.setHeader('X-CSRF-Token', csrfToken);
  }
  
  next();
};

// Export all middlewares as individual functions and as a combined object
export const authMiddleware = {
  protect,
  authorize,
  authorizeExpertise,
  admin,
  expert,
  secureCookieSettings,
  csrfProtection
}; 