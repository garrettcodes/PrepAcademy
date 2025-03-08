/**
 * Learning Style Detector Utility
 * 
 * This utility analyzes a user's performance on different question formats
 * to determine their preferred learning style.
 */

interface FormatScore {
  correct: number;
  total: number;
}

interface FormatScores {
  [format: string]: FormatScore;
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';

/**
 * Analyzes question format performance to determine the most effective learning style
 * 
 * @param formatScores - Object containing scores for each question format
 * @returns The detected learning style
 */
export const detectLearningStyle = (formatScores: FormatScores): LearningStyle => {
  // Calculate effectiveness percentage for each format
  const formatEffectiveness: Record<string, number> = {};
  
  Object.entries(formatScores).forEach(([format, { correct, total }]) => {
    // Only consider formats with at least 2 questions answered
    if (total >= 2) {
      formatEffectiveness[format] = (correct / total) * 100;
    }
  });
  
  // Find format with highest effectiveness
  // Sort by effectiveness (highest first)
  const sortedFormats = Object.entries(formatEffectiveness)
    .sort((a, b) => b[1] - a[1]);
  
  // If no formats have enough questions or all have 0% effectiveness, return default
  if (sortedFormats.length === 0) {
    return 'visual'; // Default learning style
  }
  
  // Get the best performing format
  const bestFormat = sortedFormats[0][0];
  
  // Map format to learning style
  switch (bestFormat) {
    case 'text':
      return 'reading/writing';
    case 'diagram':
      return 'visual';
    case 'audio':
      return 'auditory';
    case 'video':
      return 'kinesthetic';
    default:
      return 'visual'; // Default to visual if format not recognized
  }
};

/**
 * Provides learning style-specific study recommendations
 * 
 * @param learningStyle - The user's learning style
 * @returns Array of learning style specific recommendations
 */
export const getLearningStyleRecommendations = (learningStyle: LearningStyle): string[] => {
  switch (learningStyle) {
    case 'visual':
      return [
        'Use diagrams, charts, and graphs to visualize concepts',
        'Highlight key information with different colors',
        'Watch video tutorials and demonstrations',
        'Create mind maps to connect ideas',
        'Use visual flashcards with diagrams'
      ];
    
    case 'auditory':
      return [
        'Record and listen to lectures or explanations',
        'Join study groups for discussion',
        'Read material aloud to yourself',
        'Use mnemonic devices and verbal repetition',
        'Explain concepts to others verbally'
      ];
    
    case 'kinesthetic':
      return [
        'Practice hands-on problems and activities',
        'Take breaks and move around while studying',
        'Use physical models or manipulatives',
        'Incorporate role-play for complex scenarios',
        'Take notes by hand rather than typing'
      ];
    
    case 'reading/writing':
      return [
        'Take detailed notes in your own words',
        'Rewrite key concepts in list format',
        'Create written summaries of material',
        'Use text-based resources and books',
        'Practice by writing practice questions and answers'
      ];
    
    default:
      return [
        'Try different study methods to find what works best',
        'Mix visual, auditory, and hands-on learning activities',
        'Take notes in various formats',
        'Join study groups for collaborative learning'
      ];
  }
}; 