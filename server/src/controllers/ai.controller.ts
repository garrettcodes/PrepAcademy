import { Request, Response } from 'express';
import Question from '../models/question.model';
import User from '../models/user.model';
import * as aiService from '../services/ai.service';

// Check if AI integration is enabled
export const getAiStatus = async (req: Request, res: Response) => {
  try {
    // This would check for OpenAI credentials in environment variables
    // For now, we'll just indicate it's not fully implemented
    const aiEnabled = process.env.OPENAI_API_KEY !== undefined;
    
    res.status(200).json({ 
      enabled: aiEnabled,
      provider: aiEnabled ? 'OpenAI' : 'Static',
      availableModels: aiEnabled ? ['gpt-3.5-turbo', 'gpt-4'] : []
    });
  } catch (error: any) {
    console.error('Get AI status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a hint for a question
export const getHint = async (req: Request, res: Response) => {
  try {
    const { questionId, hintIndex = 0 } = req.body;

    // Get the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if hints exist
    if (!question.hints || question.hints.length === 0) {
      return res.status(404).json({ message: 'No hints available for this question' });
    }

    // Get hint using AI service
    const hint = await aiService.generateHint(question, hintIndex);

    res.status(200).json({ hint });
  } catch (error: any) {
    console.error('Get hint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get an explanation for a question
export const getExplanation = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.body;
    const userId = req.user.userId;

    // Get the question
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Get user to determine learning style
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get explanation using AI service
    const explanation = await aiService.generateExplanation(question, user);

    res.status(200).json({ explanation });
  } catch (error: any) {
    console.error('Get explanation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get personalized study recommendations
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subject } = req.body;

    // Get user to determine learning style
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recommendations using AI service
    const recommendations = await aiService.generateRecommendations(user, subject);

    res.status(200).json({ recommendations });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 