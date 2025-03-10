import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define parent interface
interface Parent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  students: Array<string>;
  notificationSettings: {
    email: boolean;
    sms: boolean;
  };
  token: string;
}

// Define student interface
interface Student {
  _id: string;
  name: string;
  email: string;
  learningStyle: string;
  targetScore: number;
  testDate: string;
  points: number;
}

// Define parent auth context interface
interface IParentAuthContext {
  parent: Parent | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  linkStudent: (studentEmail: string) => Promise<void>;
  getStudentDetails: (studentId: string) => Promise<Student | null>;
  updateNotificationSettings: (settings: { email?: boolean; sms?: boolean }) => Promise<void>;
}

// Create parent auth context
const ParentAuthContext = createContext<IParentAuthContext | undefined>(undefined);

// Create parent auth provider component
export const ParentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load parent from local storage on initial render
  useEffect(() => {
    const storedParent = localStorage.getItem('parent');
    if (storedParent) {
      try {
        const parsedParent = JSON.parse(storedParent);
        setParent(parsedParent);
        setIsAuthenticated(true);
        // Set default axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedParent.token}`;
      } catch (err) {
        console.error('Error parsing stored parent:', err);
        localStorage.removeItem('parent');
      }
    }
    setLoading(false);
  }, []);

  // Register parent
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/parents/register`, {
        name,
        email,
        password,
        phone,
      });

      const newParent = response.data;

      // Store parent in local storage and state
      localStorage.setItem('parent', JSON.stringify(newParent));
      setParent(newParent);
      setIsAuthenticated(true);
      setError(null);

      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newParent.token}`;

      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Login parent
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/parents/login`, {
        email,
        password,
      });

      const loggedInParent = response.data;

      // Store parent in local storage and state
      localStorage.setItem('parent', JSON.stringify(loggedInParent));
      setParent(loggedInParent);
      setIsAuthenticated(true);
      setError(null);

      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${loggedInParent.token}`;

      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Logout parent
  const logout = () => {
    localStorage.removeItem('parent');
    setParent(null);
    setIsAuthenticated(false);
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    navigate('/parent/login');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Link student to parent account
  const linkStudent = async (studentEmail: string) => {
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/parents/link-student`,
        { studentEmail },
        {
          headers: {
            Authorization: `Bearer ${parent?.token}`,
          },
        }
      );

      // Refresh parent data to get updated student list
      const meResponse = await axios.get(`${API_URL}/parents/me`, {
        headers: {
          Authorization: `Bearer ${parent?.token}`,
        },
      });

      const updatedParent = { ...meResponse.data, token: parent?.token };
      
      // Update parent in storage and state
      localStorage.setItem('parent', JSON.stringify(updatedParent));
      setParent(updatedParent);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error linking student to account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get student details
  const getStudentDetails = async (studentId: string): Promise<Student | null> => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/parents/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${parent?.token}`,
        },
      });
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching student details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings: { email?: boolean; sms?: boolean }) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/parents/notifications`,
        settings,
        {
          headers: {
            Authorization: `Bearer ${parent?.token}`,
          },
        }
      );

      // Update parent in state and storage
      if (parent) {
        const updatedParent = {
          ...parent,
          notificationSettings: response.data.notificationSettings,
        };
        
        localStorage.setItem('parent', JSON.stringify(updatedParent));
        setParent(updatedParent);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating notification settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParentAuthContext.Provider
      value={{
        parent,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        linkStudent,
        getStudentDetails,
        updateNotificationSettings,
      }}
    >
      {children}
    </ParentAuthContext.Provider>
  );
};

// Create custom hook to use parent auth context
export const useParentAuth = () => {
  const context = useContext(ParentAuthContext);
  if (context === undefined) {
    throw new Error('useParentAuth must be used within a ParentAuthProvider');
  }
  return context;
}; 