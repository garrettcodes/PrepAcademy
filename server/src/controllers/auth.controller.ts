import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, learningStyle, targetScore, testDate } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      learningStyle: learningStyle || 'visual',
      targetScore: targetScore || 0,
      testDate: testDate || Date.now(),
    });

    if (user) {
      // Generate JWT token
      const token = generateToken(user);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        learningStyle: user.learningStyle,
        targetScore: user.targetScore,
        testDate: user.testDate,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      learningStyle: user.learningStyle,
      targetScore: user.targetScore,
      testDate: user.testDate,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      learningStyle: user.learningStyle,
      targetScore: user.targetScore,
      testDate: user.testDate,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 