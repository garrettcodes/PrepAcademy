import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for fetching and updating performance data
 */
const performanceService = {
  /**
   * Get user's performance data with optional filters
   * @param subject - Optional subject filter
   * @param startDate - Optional start date filter (ISO string)
   * @param endDate - Optional end date filter (ISO string)
   * @returns Promise with the performance data
   */
  getPerformanceData: async (subject?: string, startDate?: string, endDate?: string): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Build query string
      let queryParams = new URLSearchParams();
      if (subject) queryParams.append('subject', subject);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const url = `${API_URL}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw error;
    }
  },

  /**
   * Save study time for a subject
   * @param subject - The subject studied
   * @param subtopic - The subtopic studied
   * @param studyTime - Time spent studying in minutes
   * @param score - Optional score (0-100) if this was an assessment
   * @returns Promise with the saved performance data
   */
  saveStudyTime: async (
    subject: string,
    subtopic: string,
    studyTime: number,
    score?: number
  ): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${API_URL}/performance`;
      const data = {
        subject,
        subtopic,
        studyTime,
        score: score !== undefined ? score : 0,
      };

      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error saving study time:', error);
      throw error;
    }
  },
};

export default performanceService; 