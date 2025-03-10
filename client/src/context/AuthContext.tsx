import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define user interface
interface User {
  _id: string;
  name: string;
  email: string;
  learningStyle: string;
  targetScore: number;
  testDate: string;
  points: number;
  badges: Array<{
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>;
  token: string;
}

// Define auth context interface
interface IAuthContext {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  miniAssessmentDue: boolean;
  nextMiniAssessmentDate: Date | null;
  checkMiniAssessmentStatus: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Create auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [miniAssessmentDue, setMiniAssessmentDue] = useState<boolean>(false);
  const [nextMiniAssessmentDate, setNextMiniAssessmentDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Load user from local storage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Set default axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      const { token, ...userData } = response.data;
      const newUser = { ...userData, token };

      // Store user in local storage and state
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      setError(null);

      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, ...userData } = response.data;
      const loggedInUser = { ...userData, token };

      // Store user in local storage and state
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsAuthenticated(true);
      setError(null);

      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check mini-assessment status
  const checkMiniAssessmentStatus = async () => {
    if (!isAuthenticated) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.get(`${API_URL}/mini-assessment/status`, config);
      setMiniAssessmentDue(response.data.isDue);
      setNextMiniAssessmentDate(response.data.nextAssessmentDate ? new Date(response.data.nextAssessmentDate) : null);
    } catch (error) {
      console.error('Error checking mini-assessment status:', error);
    }
  };

  useEffect(() => {
    // Check mini-assessment status on initial load and when auth state changes
    if (isAuthenticated) {
      checkMiniAssessmentStatus();
    }
  }, [isAuthenticated]);

  // Set up periodic check for mini-assessment status
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every hour
    const interval = setInterval(() => {
      checkMiniAssessmentStatus();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        miniAssessmentDue,
        nextMiniAssessmentDate,
        checkMiniAssessmentStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create hook for using auth context
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 