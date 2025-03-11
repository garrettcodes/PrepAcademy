import { API_URL } from './api';

// Define types
export interface UserUsageStats {
  completedExams: number;
  completedPracticeQuestions: number;
  studyHours: number;
  joinedStudyGroups: number;
  createdNotes: number;
  sharedNotes: number;
  lastLoginDate: string;
  subscriptionStartDate: string;
  subscriptionRenewalDate: string;
  // Add more stats as needed
}

export const getUserUsageStats = async (): Promise<UserUsageStats> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/stats/usage`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user stats');
  }

  return response.json();
};

// Mock service for development - remove in production
export const getMockUserUsageStats = async (): Promise<UserUsageStats> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    completedExams: 12,
    completedPracticeQuestions: 845,
    studyHours: 68,
    joinedStudyGroups: 3,
    createdNotes: 24,
    sharedNotes: 7,
    lastLoginDate: new Date().toISOString(),
    subscriptionStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    subscriptionRenewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  };
}; 