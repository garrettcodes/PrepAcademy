import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { generateToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { initializeOnboarding } from './onboarding.controller';

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
      onboardingCompleted: false, // Set initial onboarding status
    });

    if (user) {
      // Initialize onboarding for the new user
      await initializeOnboarding(user._id.toString());
      
      // Generate JWT token
      const token = generateToken(user);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        learningStyle: user.learningStyle,
        targetScore: user.targetScore,
        testDate: user.testDate,
        onboardingCompleted: user.onboardingCompleted,
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

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      learningStyle: user.learningStyle,
      targetScore: user.targetScore,
      testDate: user.testDate,
      onboardingCompleted: user.onboardingCompleted,
      accessToken, // Now sending accessToken instead of token
      refreshToken, // Also sending refreshToken
      tokenType: 'Bearer',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).populate('badges');
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
      points: user.points,
      badges: user.badges,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded.userId || decoded.tokenType !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(user, decoded.userType);
    
    res.status(200).json({
      accessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token', error: error.message });
  }
}; 