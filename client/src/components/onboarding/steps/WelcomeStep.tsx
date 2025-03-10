import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to PrepAcademy!</h2>
        <p className="text-gray-600 text-lg">
          Your journey to test success starts here. Let's get you set up for success.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">What is PrepAcademy?</h3>
            <p className="text-gray-600 mt-1">
              PrepAcademy is your all-in-one platform for test preparation. We combine personalized learning with proven strategies to help you achieve your target score.
            </p>
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <div className="bg-green-100 rounded-full p-3 mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">How it Works</h3>
            <p className="text-gray-600 mt-1">
              Over the next few minutes, we'll guide you through the key features of the platform and help you get started with your test preparation journey.
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-purple-100 rounded-full p-3 mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Personalized Experience</h3>
            <p className="text-gray-600 mt-1">
              Our platform adapts to your learning style, strengths, and weaknesses to provide a tailored experience that maximizes your study time and effectiveness.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What You'll Learn in this Tour:</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">1</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Diagnostic Testing</p>
              <p className="text-gray-600 text-sm">How to identify your strengths and weaknesses</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">2</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Study Planning</p>
              <p className="text-gray-600 text-sm">Creating and following your personalized study plan</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">3</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Practice Exams</p>
              <p className="text-gray-600 text-sm">How to effectively use practice tests to improve</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">4</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">App Navigation</p>
              <p className="text-gray-600 text-sm">Finding your way around the platform</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">5</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Progress Tracking</p>
              <p className="text-gray-600 text-sm">Monitoring your improvement over time</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-lg"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep; 