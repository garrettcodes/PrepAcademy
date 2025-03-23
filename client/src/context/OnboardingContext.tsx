import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingContextType {
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  steps: OnboardingStep[];
  isOnboardingCompleted: boolean;
  completeStep: (stepId: string) => Promise<boolean>;
  skipOnboarding: () => Promise<boolean>;
  resetOnboarding: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { isOnline, addPendingAction } = useOffline();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcomeIntro',
      title: 'Welcome to PrepAcademy',
      description: 'Let us show you around the app and how to get the most out of it.',
      completed: false,
    },
    {
      id: 'diagnosticTest',
      title: 'Diagnostic Test',
      description: 'Take a diagnostic test to identify your strengths and areas for improvement.',
      completed: false,
    },
    {
      id: 'studyPlan',
      title: 'Your Study Plan',
      description: 'Learn how to use your personalized study plan to maximize your learning.',
      completed: false,
    },
    {
      id: 'practiceExams',
      title: 'Practice Exams',
      description: 'Understand how to use practice exams to improve your test performance.',
      completed: false,
    },
    {
      id: 'appNavigation',
      title: 'Navigating the App',
      description: 'Learn how to navigate the app efficiently to find what you need.',
      completed: false,
    },
    {
      id: 'progressTracking',
      title: 'Tracking Your Progress',
      description: 'See how to track your progress and stay motivated.',
      completed: false,
    },
  ]);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  
  // Fetch onboarding status when authenticated
  useEffect(() => {
    if (isAuthenticated && token && isOnline) {
      fetchOnboardingStatus();
    }
  }, [isAuthenticated, token, isOnline]);
  
  const fetchOnboardingStatus = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/onboarding/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setIsOnboardingCompleted(response.data.isCompleted);
      
      // Update the steps with the completed status from the backend
      if (response.data.onboarding && response.data.onboarding.steps) {
        setSteps((prevSteps) => {
          const updatedSteps = prevSteps.map((step) => ({
            ...step,
            completed:
              response.data.onboarding.steps[step.id] || step.completed,
          }));
        
          // Set the current step to the first incomplete step
          const firstIncompleteStepIndex = updatedSteps.findIndex(
            (step) => !response.data.onboarding.steps[step.id]
          );
          
          if (firstIncompleteStepIndex !== -1) {
            setCurrentStep(firstIncompleteStepIndex);
          } else {
            setCurrentStep(updatedSteps.length - 1);
          }
          
          return updatedSteps;
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
      setError('Failed to fetch onboarding status');
      setIsLoading(false);
    }
  };
  
  const completeStep = async (stepId: string): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If offline, store the action for later sync
      if (!isOnline) {
        addPendingAction({
          type: 'COMPLETE_ONBOARDING_STEP',
          data: {
            stepId,
          },
        });
        
        // Update local state optimistically
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          )
        );
        
        // Move to the next step if available
        const stepIndex = steps.findIndex((step) => step.id === stepId);
        if (stepIndex < steps.length - 1) {
          setCurrentStep(stepIndex + 1);
        }
        
        setIsLoading(false);
        return true;
      }
      
      // If online, send to server
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/onboarding/step/${stepId}`,
        { completed: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      );
      
      // Check if all steps are completed
      const allStepsCompleted = steps.every((step) => 
        step.id === stepId ? true : step.completed
      );
      
      if (allStepsCompleted) {
        setIsOnboardingCompleted(true);
      } else {
        // Move to the next step if available
        const stepIndex = steps.findIndex((step) => step.id === stepId);
        if (stepIndex < steps.length - 1) {
          setCurrentStep(stepIndex + 1);
        }
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
      setError('Failed to complete onboarding step');
      setIsLoading(false);
      return false;
    }
  };
  
  const skipOnboarding = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If offline, store the action for later sync
      if (!isOnline) {
        addPendingAction({
          type: 'SKIP_ONBOARDING',
          data: {},
        });
        
        // Update local state
        setIsOnboardingCompleted(true);
        
        setIsLoading(false);
        return true;
      }
      
      // If online, send to server
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/onboarding/skip`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setIsOnboardingCompleted(true);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      setError('Failed to skip onboarding');
      setIsLoading(false);
      return false;
    }
  };
  
  const resetOnboarding = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If offline, store the action for later sync
      if (!isOnline) {
        addPendingAction({
          type: 'RESET_ONBOARDING',
          data: {},
        });
        
        // Update local state
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            completed: false,
          }))
        );
        setCurrentStep(0);
        setIsOnboardingCompleted(false);
        
        setIsLoading(false);
        return true;
      }
      
      // If online, send to server
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/onboarding/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          completed: false,
        }))
      );
      setCurrentStep(0);
      setIsOnboardingCompleted(false);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      setError('Failed to reset onboarding');
      setIsLoading(false);
      return false;
    }
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        isLoading,
        error,
        currentStep,
        steps,
        isOnboardingCompleted,
        completeStep,
        skipOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}; 