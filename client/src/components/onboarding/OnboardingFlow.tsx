import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import DiagnosticTestStep from './steps/DiagnosticTestStep';
import StudyPlanStep from './steps/StudyPlanStep';
import PracticeExamsStep from './steps/PracticeExamsStep';
import AppNavigationStep from './steps/AppNavigationStep';
import ProgressTrackingStep from './steps/ProgressTrackingStep';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isLoading, 
    error, 
    currentStep, 
    steps, 
    isOnboardingCompleted,
    completeStep, 
    skipOnboarding 
  } = useOnboarding();
  
  const [showProgress, setShowProgress] = useState(true);
  
  // If onboarding is completed, redirect to dashboard
  useEffect(() => {
    if (isOnboardingCompleted) {
      navigate('/dashboard');
    }
  }, [isOnboardingCompleted, navigate]);
  
  const handleNext = async () => {
    // Complete the current step
    const stepId = steps[currentStep].id;
    await completeStep(stepId);
  };
  
  const handleSkip = async () => {
    await skipOnboarding();
  };
  
  const handleToggleProgress = () => {
    setShowProgress(!showProgress);
  };
  
  // Render the appropriate step component based on current step
  const renderStepComponent = () => {
    const stepId = steps[currentStep].id;
    
    switch (stepId) {
      case 'welcomeIntro':
        return <WelcomeStep onNext={handleNext} />;
      case 'diagnosticTest':
        return <DiagnosticTestStep onNext={handleNext} />;
      case 'studyPlan':
        return <StudyPlanStep onNext={handleNext} />;
      case 'practiceExams':
        return <PracticeExamsStep onNext={handleNext} />;
      case 'appNavigation':
        return <AppNavigationStep onNext={handleNext} />;
      case 'progressTracking':
        return <ProgressTrackingStep onNext={handleNext} />;
      default:
        return <div>Step not found</div>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress header */}
      <header className={`bg-white border-b border-gray-200 transition-all ${showProgress ? 'py-4' : 'py-2'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">PrepAcademy Onboarding</h1>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Skip for now
            </button>
          </div>
          
          {showProgress && (
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleToggleProgress}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Hide progress
                </button>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center mb-2 ${
                        index < currentStep
                          ? 'bg-blue-600 text-white'
                          : index === currentStep
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs text-gray-500 text-center hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!showProgress && (
            <button
              onClick={handleToggleProgress}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Show progress
            </button>
          )}
        </div>
      </header>
      
      {/* Step content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {renderStepComponent()}
      </div>
    </div>
  );
};

export default OnboardingFlow; 