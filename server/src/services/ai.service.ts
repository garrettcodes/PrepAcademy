/**
 * AI Service
 * 
 * Provides integration with AI services like OpenAI.
 * Falls back to static content when AI services are not available.
 */

import Question from '../models/question.model';
import User from '../models/user.model';
import axios from 'axios';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Check if OpenAI integration is available
const isAiEnabled = () => {
  return !!OPENAI_API_KEY;
};

/**
 * Generate a hint using OpenAI
 * @param question - The question object
 * @param hintIndex - The index of the hint to retrieve (0-based)
 * @returns The generated hint
 */
export const generateHint = async (question: any, hintIndex: number = 0): Promise<string> => {
  // If OpenAI is not configured or this is a fallback, use static hint
  if (!isAiEnabled() || !question.hints || question.hints.length === 0) {
    // Return static hint if available
    if (question.hints && question.hints.length > hintIndex) {
      return question.hints[hintIndex];
    }
    
    // Default generic hint
    return `Think about the core concepts related to ${question.subject}.`;
  }

  try {
    // Get previous hints to maintain context
    const previousHints = question.hints.slice(0, hintIndex);
    const requestHintNumber = hintIndex + 1;
    
    // Create a prompt for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an educational AI assistant that provides helpful hints for test questions. 
                 Provide a hint that guides the student toward the answer without directly giving it away.
                 The hint should be appropriate for the question difficulty level.
                 This is hint #${requestHintNumber} for this question, so it should be more revealing than earlier hints.`
      },
      {
        role: 'user',
        content: `Question: ${question.text}
                 Subject: ${question.subject}
                 Difficulty: ${question.difficulty}
                 Options: ${question.options ? question.options.join(', ') : 'N/A'}
                 Correct Answer: ${question.correctAnswer}
                 ${previousHints.length > 0 ? `Previous hints: ${previousHints.join(' / ')}` : ''}
                 
                 Provide hint #${requestHintNumber} for this question.`
      }
    ];

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_MODEL,
        messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    // Extract and return the generated hint
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI hint generation error:', error);
    
    // Fallback to static hint if available
    if (question.hints && question.hints.length > hintIndex) {
      return question.hints[hintIndex];
    }
    
    return `Think about the key concepts in ${question.subject}.`;
  }
};

/**
 * Generate an explanation using OpenAI tailored to learning style
 * @param question - The question object
 * @param user - The user object containing learning style
 * @returns The generated explanation
 */
export const generateExplanation = async (question: any, user: any): Promise<string> => {
  // Determine learning style
  const learningStyle = user?.learningStyle || 'text';
  
  // If OpenAI is not configured, use static explanation
  if (!isAiEnabled()) {
    // Return explanation based on learning style if available
    if (question.explanations?.[learningStyle]) {
      return question.explanations[learningStyle];
    }
    
    // Fall back to text explanation
    if (question.explanations?.text) {
      return question.explanations.text;
    }
    
    // Default generic explanation
    return `The correct answer is ${question.correctAnswer}.`;
  }

  try {
    // Customize guidance based on learning style
    let styleSpecificGuidance = '';
    
    switch (learningStyle) {
      case 'visual':
        styleSpecificGuidance = 'Use vivid imagery, descriptions of visual concepts, and spatial relationships. Mention colors, shapes, and visual patterns when relevant. Describe how the concept might be represented in a diagram or chart.';
        break;
      case 'auditory':
        styleSpecificGuidance = 'Use sound-based analogies and verbal explanations. Phrase concepts as spoken narratives. Use rhythm, mnemonic devices, and sound associations when possible.';
        break;
      case 'kinesthetic':
        styleSpecificGuidance = 'Use physical analogies and real-world examples. Relate concepts to physical sensations and movements. Describe how the student might interact with or experience the concept.';
        break;
      default: // text/reading
        styleSpecificGuidance = 'Provide a clear, concise textual explanation with logical structure. Use precise language and clear definitions.';
    }

    // Create a prompt for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an educational AI assistant that provides detailed explanations for test questions.
                 Tailor your explanation to a ${learningStyle} learning style.
                 ${styleSpecificGuidance}
                 Be thorough but concise and focus on helping the student understand the concept.`
      },
      {
        role: 'user',
        content: `Question: ${question.text}
                 Subject: ${question.subject}
                 Difficulty: ${question.difficulty}
                 Options: ${question.options ? question.options.join(', ') : 'N/A'}
                 Correct Answer: ${question.correctAnswer}
                 
                 Please explain why this answer is correct in a way that would help a ${learningStyle} learner.`
      }
    ];

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    // Extract and return the generated explanation
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI explanation generation error:', error);
    
    // Fallback to static explanation based on learning style
    if (question.explanations?.[learningStyle]) {
      return question.explanations[learningStyle];
    }
    
    // Fall back to text explanation
    if (question.explanations?.text) {
      return question.explanations.text;
    }
    
    return `The correct answer is ${question.correctAnswer}.`;
  }
};

/**
 * Generate study recommendations using OpenAI
 * @param user - The user object containing learning style
 * @param subject - Optional subject to focus recommendations on
 * @returns Array of study recommendations
 */
export const generateRecommendations = async (user: any, subject?: string): Promise<string[]> => {
  // Determine learning style
  const learningStyle = user?.learningStyle || 'text';
  
  // If OpenAI is not configured, use static recommendations
  if (!isAiEnabled()) {
    return getStaticRecommendations(learningStyle, subject);
  }

  try {
    // Create a prompt for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an educational AI assistant that provides personalized study recommendations.
                 Tailor your recommendations to a ${learningStyle} learning style.
                 Provide practical, specific study strategies that leverage the student's learning preferences.
                 Focus on actionable advice rather than general principles.`
      },
      {
        role: 'user',
        content: `Learning Style: ${learningStyle}
                 ${subject ? `Subject: ${subject}` : 'General study recommendations'}
                 Target Exam: ${user.targetScore ? `Aiming for a score of ${user.targetScore}` : 'SAT/ACT'}
                 
                 Please provide 5-7 specific study recommendations that would be effective for a ${learningStyle} learner 
                 ${subject ? `studying ${subject}` : 'preparing for standardized tests'}.`
      }
    ];

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: DEFAULT_MODEL,
        messages,
        max_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    // Process the response to extract recommendations as bullet points
    const content = response.data.choices[0].message.content.trim();
    
    // Parse the content to extract individual recommendations
    const recommendations = content
      .split(/\n+/)
      .filter((line: string) => /^[\d\-\*\•\★\▪\♦]/.test(line.trim()))
      .map((line: string) => line.replace(/^[\d\-\*\•\★\▪\♦]+\s*/, '').trim());
    
    // Ensure we have at least a few recommendations
    if (recommendations.length >= 3) {
      return recommendations;
    }
    
    // If formatting didn't work, split by sentences and take the first few
    const sentences = content
      .split(/\.\s+/)
      .filter((sentence: string) => sentence.length > 20)
      .map((sentence: string) => sentence.trim() + '.');
    
    return sentences.slice(0, 7);
  } catch (error) {
    console.error('OpenAI recommendations generation error:', error);
    
    // Fallback to static recommendations
    return getStaticRecommendations(learningStyle, subject);
  }
};

/**
 * Get static recommendations based on learning style
 * @param learningStyle - The user's learning style
 * @param subject - Optional subject to focus recommendations on
 * @returns Array of study recommendations
 */
const getStaticRecommendations = (learningStyle: string, subject?: string): string[] => {
  const recommendations: string[] = [];
  
  if (subject) {
    // Subject-specific recommendations
    if (learningStyle === 'visual') {
      recommendations.push(
        `Watch video tutorials on ${subject}`,
        `Study diagrams and charts related to ${subject}`,
        `Create mind maps for ${subject} concepts`,
        `Use color-coding in your ${subject} notes`,
        `Find infographics about ${subject} topics`
      );
    } else if (learningStyle === 'auditory') {
      recommendations.push(
        `Listen to audio lectures on ${subject}`,
        `Participate in group discussions about ${subject}`,
        `Record yourself explaining ${subject} concepts and listen back`,
        `Find podcasts that discuss ${subject} topics`,
        `Read ${subject} material aloud to yourself`
      );
    } else if (learningStyle === 'kinesthetic') {
      recommendations.push(
        `Practice hands-on exercises for ${subject}`,
        `Use flashcards for ${subject} terms`,
        `Teach ${subject} concepts to someone else`,
        `Take breaks and move around when studying ${subject}`,
        `Create physical models of ${subject} concepts when possible`
      );
    } else { // text/reading
      recommendations.push(
        `Read textbook chapters on ${subject}`,
        `Take detailed notes on ${subject}`,
        `Write summaries of ${subject} concepts`,
        `Create outlines of ${subject} material`,
        `Practice writing explanations of ${subject} topics`
      );
    }
  } else {
    // General recommendations
    if (learningStyle === 'visual') {
      recommendations.push(
        'Watch video tutorials',
        'Study diagrams and charts',
        'Create mind maps for key concepts',
        'Use color-coding in your notes',
        'Convert text notes into visual formats'
      );
    } else if (learningStyle === 'auditory') {
      recommendations.push(
        'Listen to audio lectures',
        'Participate in group discussions',
        'Record yourself explaining concepts and listen back',
        'Use verbal repetition to memorize facts',
        'Read important material aloud to yourself'
      );
    } else if (learningStyle === 'kinesthetic') {
      recommendations.push(
        'Practice hands-on exercises',
        'Use flashcards for terms',
        'Teach concepts to someone else',
        'Study while standing or moving',
        'Take regular breaks during study sessions'
      );
    } else { // text/reading
      recommendations.push(
        'Read textbook chapters',
        'Take detailed notes',
        'Write summaries of concepts',
        'Create structured outlines',
        'Rewrite your notes to reinforce learning'
      );
    }
  }

  // Add general test-taking strategies
  recommendations.push(
    'Practice time management during exams',
    'Review mistakes from previous practice tests',
    'Get adequate sleep before study sessions and exams'
  );

  return recommendations;
}; 