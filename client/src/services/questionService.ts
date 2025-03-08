import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for interacting with question-related API endpoints
 */
const questionService = {
  /**
   * Get a hint for a specific question
   * @param questionId - The ID of the question
   * @param hintIndex - The index of the hint to retrieve (optional)
   * @returns Promise with the hint data
   */
  getHint: async (questionId: string, hintIndex?: number): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${API_URL}/questions/${questionId}/hint${hintIndex !== undefined ? `?hintIndex=${hintIndex}` : ''}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.hint;
    } catch (error) {
      console.error('Error fetching hint:', error);
      throw error;
    }
  },

  /**
   * Get an explanation for a specific question
   * @param questionId - The ID of the question
   * @param learningStyle - The learning style to get explanation for (visual, auditory, kinesthetic, text)
   * @returns Promise with the explanation data
   */
  getExplanation: async (questionId: string, learningStyle: string): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${API_URL}/questions/${questionId}/explanation?learningStyle=${learningStyle}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.explanation;
    } catch (error) {
      console.error('Error fetching explanation:', error);
      throw error;
    }
  },
};

export default questionService; 