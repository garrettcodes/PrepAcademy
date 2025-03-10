import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';
import { IParent } from '../models/parent.model';

// Generate JWT token
export const generateToken = (user: IUser | IParent, userType: 'student' | 'parent' = 'student'): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    userType,
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