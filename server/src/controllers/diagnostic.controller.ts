import { Request, Response } from 'express';
import Question from '../models/question.model';
import User from '../models/user.model';
import StudyPlan from '../models/studyPlan.model';
import PerformanceData from '../models/performanceData.model';
import { detectLearningStyle, getLearningStyleRecommendations } from '../utils/learningStyleDetector';
import { generateStudyPlan } from '../utils/studyPlanGenerator';

// Extend Request type to include user property
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// Get diagnostic test questions
export const getDiagnosticQuestions = async (req: Request, res: Response) => {
  try {
    // Get a mix of questions from different subjects and formats
    const questions = await Question.aggregate([
      { $match: { difficulty: 'medium' } }, // Start with medium difficulty
      { $sample: { size: 20 } }, // Get 20 random questions
    ]);

    if (!questions || questions.length === 0) {
      // If no questions found, let's create some sample questions with different formats
      const sampleQuestions = [
        // Text format questions (Math)
        {
          text: "Solve for x: 2x + 5 = 15",
          options: ["x = 5", "x = 10", "x = 7.5", "x = 4.5"],
          correctAnswer: "x = 5",
          subject: "Math",
          difficulty: "medium",
          format: "text",
        },
        {
          text: "What is the area of a circle with radius 4 units?",
          options: ["16π square units", "8π square units", "4π square units", "12π square units"],
          correctAnswer: "16π square units",
          subject: "Math",
          difficulty: "medium",
          format: "text",
        },
        
        // Diagram format questions (Math)
        {
          text: "What is the value of angle x in the triangle below?",
          options: ["30°", "45°", "60°", "90°"],
          correctAnswer: "60°",
          subject: "Math",
          difficulty: "medium",
          format: "diagram",
          imageUrl: "https://example.com/triangle-diagram.png", // This would be a real image URL in production
        },
        {
          text: "Which graph represents the function y = x² + 2x - 3?",
          options: ["Graph A", "Graph B", "Graph C", "Graph D"],
          correctAnswer: "Graph C",
          subject: "Math",
          difficulty: "medium",
          format: "diagram",
          imageUrl: "https://example.com/function-graphs.png", // This would be a real image URL in production
        },
        
        // Audio format questions (English)
        {
          text: "Listen to the pronunciation and select the correctly spelled word:",
          options: ["Necessary", "Neccessary", "Necesary", "Neccesary"],
          correctAnswer: "Necessary",
          subject: "English",
          difficulty: "medium",
          format: "audio",
          audioUrl: "https://example.com/pronunciation.mp3", // This would be a real audio URL in production
        },
        {
          text: "Listen to the passage and identify the main theme:",
          options: ["Environmental conservation", "Economic policy", "Historical events", "Cultural diversity"],
          correctAnswer: "Environmental conservation",
          subject: "English",
          difficulty: "medium",
          format: "audio",
          audioUrl: "https://example.com/passage.mp3", // This would be a real audio URL in production
        },
        
        // Add more sample questions for each format...
        // Reading questions (text format)
        {
          text: "According to the passage, what was the author's main argument?",
          options: ["Technology improves education", "Traditional methods are more effective", "A balanced approach is best", "No clear conclusion was provided"],
          correctAnswer: "A balanced approach is best",
          subject: "Reading",
          difficulty: "medium",
          format: "text",
        },
        
        // Science questions with diagrams
        {
          text: "Identify the organelle labeled 'X' in the cell diagram:",
          options: ["Mitochondrion", "Nucleus", "Endoplasmic Reticulum", "Golgi Apparatus"],
          correctAnswer: "Mitochondrion",
          subject: "Science",
          difficulty: "medium",
          format: "diagram",
          imageUrl: "https://example.com/cell-diagram.png", // This would be a real image URL in production
        },
      ];
      
      // Return sample questions
      return res.status(200).json(sampleQuestions);
    }

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Get diagnostic questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit diagnostic test answers
export const submitDiagnosticTest = async (req: AuthRequest, res: Response) => {
  try {
    const { answers, learningStyle: clientLearningStyle } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Calculate score and analyze results
    let totalScore = 0;
    const subjectScores: Record<string, { correct: number; total: number }> = {};
    const formatScores: Record<string, { correct: number; total: number }> = {};

    // Initialize format scores for all standard formats
    const standardFormats = ['text', 'diagram', 'audio', 'video', 'interactive'];
    standardFormats.forEach(format => {
      formatScores[format] = { correct: 0, total: 0 };
    });

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

      // Update format scores
      if (!formatScores[question.format]) {
        formatScores[question.format] = { correct: 0, total: 0 };
      }
      
      if (isCorrect) {
        formatScores[question.format].correct += 1;
      }
      formatScores[question.format].total += 1;

      // Save performance data
      await PerformanceData.create({
        userId,
        subject: question.subject,
        subtopic: 'Diagnostic',
        score: isCorrect ? 100 : 0,
        studyTime: 0,
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

    // Determine learning style based on format performance
    // If client provided a learning style, validate it against our detection
    const detectedLearningStyle = detectLearningStyle(formatScores);
    
    // Log the learning style detection process for debugging
    console.log('Learning Style Detection:', {
      formatScores,
      detectedStyle: detectedLearningStyle,
      clientProvidedStyle: clientLearningStyle
    });
    
    // Use detected learning style (trust our algorithm over client-side)
    const finalLearningStyle = detectedLearningStyle;

    // Get learning style-specific recommendations
    const styleRecommendations = getLearningStyleRecommendations(finalLearningStyle);

    // Generate personalized study plan based on results
    const { dailyGoals, weeklyGoals } = generateStudyPlan(subjectScores, finalLearningStyle);

    // Update user's learning style and set the next mini-assessment date (2 weeks from now)
    const nextMiniAssessmentDate = new Date();
    nextMiniAssessmentDate.setDate(nextMiniAssessmentDate.getDate() + 14);
    
    await User.findByIdAndUpdate(userId, { 
      learningStyle: finalLearningStyle,
      nextMiniAssessmentDate 
    });

    // Create or update study plan based on diagnostic results
    let studyPlan = await StudyPlan.findOne({ userId });
    
    if (!studyPlan) {
      // Create new study plan
      studyPlan = await StudyPlan.create({
        userId,
        weakAreas,
        recommendations: weakAreas.map(subject => ({
          subject,
          subtopics: ['General'], // Default subtopics
          resources: [], // Empty resources to start
          priority: 'high', // High priority for weak areas
        })),
        completedTopics: [],
        overallProgress: 0,
        learningStyleRecommendations: styleRecommendations,
        dailyGoals,
        weeklyGoals,
        progress: 0
      });
    } else {
      // Update existing study plan
      studyPlan = await StudyPlan.findByIdAndUpdate(
        studyPlan._id,
        {
          weakAreas,
          recommendations: weakAreas.map(subject => ({
            subject,
            subtopics: ['General'], // Default subtopics
            resources: [], // Empty resources to start
            priority: 'high', // High priority for weak areas
          })),
          overallProgress: 0, // Reset progress after new diagnostic
          learningStyleRecommendations: styleRecommendations,
          dailyGoals,
          weeklyGoals,
          progress: 0
        },
        { new: true }
      );
    }

    // Return diagnostic results
    const diagnosticResult = {
      score: totalScore,
      subjectScores,
      formatScores,
      weakAreas,
      learningProfile: {
        learningStyle: finalLearningStyle,
        weakAreas,
        styleRecommendations,
        nextMiniAssessmentDate
      },
      studyPlan,
    };

    res.status(200).json(diagnosticResult);
  } catch (error: any) {
    console.error('Submit diagnostic test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 