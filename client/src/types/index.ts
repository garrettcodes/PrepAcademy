// Common type definitions for the PrepAcademy client application

// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor' | 'expert';
  points?: number;
  badges?: Badge[];
  profilePicture?: string;
  learningStyle?: string;
  targetScore?: number;
  testDate?: string;
  token?: string;
  onboardingCompleted?: boolean;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Add more types as needed for components, pages, and services 