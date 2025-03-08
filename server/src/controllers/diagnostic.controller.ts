import { Request, Response } from 'express';
import Question from '../models/question.model';
import User from '../models/user.model';
import StudyPlan from '../models/studyPlan.model';
import PerformanceData from '../models/performanceData.model';

// Get diagnostic test questions
export const getDiagnosticQuestions = async (req: Request, res: Response) => {
  try {
    // Get a mix of questions from different subjects and formats
    const questions = await Question.aggregate([
      { $match: { difficulty: 'medium' } }, // Start with medium difficulty
      { $sample: { size: 20 } }, // Get 20 random questions
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No diagnostic questions found' });
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Get diagnostic questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit diagnostic test answers
export const submitDiagnosticTest = async (req: Request, res: Response) => {
  try {
    const { answers, learningStyle } = req.body;
    const userId = req.user.userId;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Calculate score and analyze results
    let totalScore = 0;
    const subjectScores: Record<string, { correct: number; total: number }> = {};

    // Process each answer
    for (const answer of answers) {
      const { questionId, selectedAnswer } = answer;
      
      // Get the question
      const question = await Question.findById(questionId);
      if (!question) continue;

      // Check if answer is correct
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      // Update subject scores
      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      
      if (isCorrect) {
        subjectScores[question.subject].correct += 1;
      }
      subjectScores[question.subject].total += 1;

      // Save performance data
      await PerformanceData.create({
        userId,
        subject: question.subject,
        subtopic: 'Diagnostic', // Initial diagnostic doesn't have subtopics
        score: isCorrect ? 100 : 0,
        studyTime: 0, // No study time for diagnostic
        date: new Date(),
      });
    }

    // Calculate overall score percentage
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    Object.values(subjectScores).forEach(({ correct, total }) => {
      totalCorrect += correct;
      totalQuestions += total;
    });
    
    totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Identify weak areas (subjects with score < 60%)
    const weakAreas = Object.entries(subjectScores)
      .filter(([_, { correct, total }]) => (correct / total) * 100 < 60)
      .map(([subject]) => subject);

    // Update user's learning style if provided
    if (learningStyle) {
      await User.findByIdAndUpdate(userId, { learningStyle });
    }

    // Generate a basic study plan based on diagnostic results
    const existingPlan = await StudyPlan.findOne({ userId });
    
    const dailyGoals = weakAreas.map(subject => ({
      task: `Practice 20 ${subject} questions`,
      status: 'pending',
    }));

    const weeklyGoals = weakAreas.map(subject => ({
      task: `Complete 2 ${subject} video tutorials`,
      status: 'pending',
    }));

    let studyPlan;
    if (existingPlan) {
      // Update existing plan
      studyPlan = await StudyPlan.findByIdAndUpdate(
        existingPlan._id,
        {
          dailyGoals,
          weeklyGoals,
          progress: 0,
        },
        { new: true }
      );
    } else {
      // Create new plan
      studyPlan = await StudyPlan.create({
        userId,
        dailyGoals,
        weeklyGoals,
        progress: 0,
      });

      // Link study plan to user
      await User.findByIdAndUpdate(userId, { studyPlan: studyPlan._id });
    }

    res.status(200).json({
      score: totalScore,
      subjectScores,
      weakAreas,
      learningProfile: {
        learningStyle: learningStyle || 'visual',
        weakAreas,
      },
      studyPlan,
    });
  } catch (error: any) {
    console.error('Submit diagnostic test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 