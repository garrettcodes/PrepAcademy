import { LearningStyle } from './learningStyleDetector';

interface SubjectScore {
  correct: number;
  total: number;
}

interface WeakArea {
  subject: string;
  score: number;
}

interface Task {
  task: string;
  status: string;
  dueDate?: Date;
}

/**
 * Generates a study plan based on diagnostic test results and learning style
 *
 * @param subjectScores - Performance scores by subject
 * @param learningStyle - User's detected learning style
 * @returns Object containing daily and weekly goals
 */
export const generateStudyPlan = (
  subjectScores: Record<string, SubjectScore>,
  learningStyle: LearningStyle
): { dailyGoals: Task[], weeklyGoals: Task[] } => {
  // Identify weak areas (subjects with score < 50%)
  const weakAreas: WeakArea[] = [];
  Object.entries(subjectScores).forEach(([subject, { correct, total }]) => {
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    if (score < 50) {
      weakAreas.push({
        subject,
        score
      });
    }
  });

  // Sort weak areas by score (ascending - weakest first)
  weakAreas.sort((a, b) => a.score - b.score);

  // Generate daily goals based on weak areas and learning style
  const dailyGoals: Task[] = generateDailyGoals(weakAreas, learningStyle);
  
  // Generate weekly goals based on weak areas and learning style
  const weeklyGoals: Task[] = generateWeeklyGoals(weakAreas, learningStyle);

  return {
    dailyGoals,
    weeklyGoals
  };
};

/**
 * Generates daily goals tailored to learning style and weak areas
 */
const generateDailyGoals = (weakAreas: WeakArea[], learningStyle: LearningStyle): Task[] => {
  const goals: Task[] = [];
  const today = new Date();

  // Generate different types of goals based on learning style and weak areas
  weakAreas.forEach((area, index) => {
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + index);

    // Create goals based on learning style
    switch (learningStyle) {
      case 'visual':
        goals.push({
          task: `Complete 20 ${area.subject} practice questions with diagrams`,
          status: 'pending',
          dueDate
        });
        goals.push({
          task: `Watch 1 video tutorial on ${area.subject}`,
          status: 'pending',
          dueDate
        });
        break;
        
      case 'auditory':
        goals.push({
          task: `Listen to ${area.subject} podcast or audio lesson`,
          status: 'pending',
          dueDate
        });
        goals.push({
          task: `Record yourself explaining key concepts in ${area.subject}`,
          status: 'pending',
          dueDate
        });
        break;
        
      case 'kinesthetic':
        goals.push({
          task: `Practice 15 hands-on ${area.subject} problems`,
          status: 'pending',
          dueDate
        });
        goals.push({
          task: `Create a physical model demonstrating a key ${area.subject} concept`,
          status: 'pending',
          dueDate
        });
        break;
        
      case 'reading/writing':
        goals.push({
          task: `Read chapter on ${area.subject} and take detailed notes`,
          status: 'pending',
          dueDate
        });
        goals.push({
          task: `Write summary of key ${area.subject} concepts in your own words`,
          status: 'pending',
          dueDate
        });
        break;
        
      default:
        goals.push({
          task: `Practice 20 ${area.subject} questions`,
          status: 'pending',
          dueDate
        });
    }
  });

  // Add one general study goal that applies to all subjects
  goals.push({
    task: 'Review mistake patterns from diagnostic test',
    status: 'pending',
    dueDate: new Date(today)
  });

  return goals;
};

/**
 * Generates weekly goals tailored to learning style and weak areas
 */
const generateWeeklyGoals = (weakAreas: WeakArea[], learningStyle: LearningStyle): Task[] => {
  const goals: Task[] = [];
  const today = new Date();
  
  // Set due date for end of week
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  // Add goals for each weak area
  weakAreas.forEach((area) => {
    // Create goals based on learning style
    switch (learningStyle) {
      case 'visual':
        goals.push({
          task: `Complete 2 ${area.subject} video tutorials`,
          status: 'pending',
          dueDate: endOfWeek
        });
        goals.push({
          task: `Create visual mind map of ${area.subject} concepts`,
          status: 'pending',
          dueDate: endOfWeek
        });
        break;
        
      case 'auditory':
        goals.push({
          task: `Join study group discussion on ${area.subject}`,
          status: 'pending',
          dueDate: endOfWeek
        });
        goals.push({
          task: `Listen to 3 lectures on ${area.subject}`,
          status: 'pending', 
          dueDate: endOfWeek
        });
        break;
        
      case 'kinesthetic':
        goals.push({
          task: `Complete 1 practical project related to ${area.subject}`,
          status: 'pending',
          dueDate: endOfWeek
        });
        goals.push({
          task: `Attend interactive workshop on ${area.subject} if available`,
          status: 'pending',
          dueDate: endOfWeek
        });
        break;
        
      case 'reading/writing':
        goals.push({
          task: `Complete one practice test on ${area.subject} with written analysis`,
          status: 'pending',
          dueDate: endOfWeek
        });
        goals.push({
          task: `Read 2 chapters on ${area.subject} and write summary notes`,
          status: 'pending',
          dueDate: endOfWeek
        });
        break;
        
      default:
        goals.push({
          task: `Complete 2 ${area.subject} practice exams`,
          status: 'pending',
          dueDate: endOfWeek
        });
    }
  });

  // Add a general goal for all learning styles
  goals.push({
    task: 'Review your overall progress and adjust study priorities',
    status: 'pending',
    dueDate: endOfWeek
  });

  return goals;
}; 