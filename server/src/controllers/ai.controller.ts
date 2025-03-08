import { Request, Response } from 'express';
import Question from '../models/question.model';
import User from '../models/user.model';

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

    // Get the requested hint or the first one if index is out of bounds
    const hint = question.hints[hintIndex] || question.hints[0];

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

    // Get appropriate explanation based on user's learning style
    let explanation = question.explanations.text; // Default to text explanation
    
    if (user.learningStyle && question.explanations[user.learningStyle]) {
      explanation = question.explanations[user.learningStyle];
    }

    // If no explanation is available, provide a generic one
    if (!explanation) {
      explanation = `The correct answer is ${question.correctAnswer}. Please review the question and try again.`;
    }

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

    // Build recommendations based on learning style
    const recommendations = [];
    
    if (subject) {
      // Subject-specific recommendations
      if (user.learningStyle === 'visual') {
        recommendations.push(
          `Watch video tutorials on ${subject}`,
          `Study diagrams and charts related to ${subject}`,
          `Create mind maps for ${subject} concepts`
        );
      } else if (user.learningStyle === 'auditory') {
        recommendations.push(
          `Listen to audio lectures on ${subject}`,
          `Participate in group discussions about ${subject}`,
          `Record yourself explaining ${subject} concepts and listen back`
        );
      } else if (user.learningStyle === 'kinesthetic') {
        recommendations.push(
          `Practice hands-on exercises for ${subject}`,
          `Use flashcards for ${subject} terms`,
          `Teach ${subject} concepts to someone else`
        );
      } else {
        recommendations.push(
          `Read textbook chapters on ${subject}`,
          `Take detailed notes on ${subject}`,
          `Write summaries of ${subject} concepts`
        );
      }
    } else {
      // General recommendations
      if (user.learningStyle === 'visual') {
        recommendations.push(
          'Watch video tutorials',
          'Study diagrams and charts',
          'Create mind maps for key concepts'
        );
      } else if (user.learningStyle === 'auditory') {
        recommendations.push(
          'Listen to audio lectures',
          'Participate in group discussions',
          'Record yourself explaining concepts and listen back'
        );
      } else if (user.learningStyle === 'kinesthetic') {
        recommendations.push(
          'Practice hands-on exercises',
          'Use flashcards for terms',
          'Teach concepts to someone else'
        );
      } else {
        recommendations.push(
          'Read textbook chapters',
          'Take detailed notes',
          'Write summaries of concepts'
        );
      }
    }

    // Add general test-taking strategies
    recommendations.push(
      'Practice time management during exams',
      'Review mistakes from previous practice tests',
      'Take regular breaks during study sessions'
    );

    res.status(200).json({ recommendations });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 