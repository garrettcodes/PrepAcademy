import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';

// Generate JWT token
export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 