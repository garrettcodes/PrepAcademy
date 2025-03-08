import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all badges
export const getAllBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/badges`);
    return response.data;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
};

// Get user badges
export const getUserBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/badges/user`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
}; 