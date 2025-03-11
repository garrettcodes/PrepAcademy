import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { IParent } from '../models/parent.model';

// Generate access token (short-lived)
export const generateAccessToken = (user: IUser | IParent, userType: 'student' | 'parent' = 'student'): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    userType,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1h', // Reduced from 30d to 1h for better security
  });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user: IUser | IParent, userType: 'student' | 'parent' = 'student'): string => {
  const payload = {
    userId: user._id,
    tokenType: 'refresh',
    userType,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d', // 7 days for refresh
  });
};

// Legacy function for backward compatibility
export const generateToken = (user: IUser | IParent, userType: 'student' | 'parent' = 'student'): string => {
  console.warn('Warning: Using deprecated generateToken function. Use generateAccessToken instead.');
  return generateAccessToken(user, userType);
};

// Verify JWT access token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Verify JWT refresh token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}; 