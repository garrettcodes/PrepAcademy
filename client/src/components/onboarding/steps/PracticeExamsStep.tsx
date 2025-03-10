import React from 'react';

interface PracticeExamsStepProps {
  onNext: () => void;
}

const PracticeExamsStep: React.FC<PracticeExamsStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Exams</h2>
        <p className="text-gray-600 text-lg">
          The most effective way to prepare for your actual test.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Practice Exams Matter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Build Stamina</h4>
              <p className="text-gray-600 text-sm">
                Develop the mental endurance needed for the full test duration.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-3 mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Reduce Anxiety</h4>
              <p className="text-gray-600 text-sm">
                Become familiar with the test format and timing to feel more confident.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-3 mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Identify Weaknesses</h4>
              <p className="text-gray-600 text-sm">
                Discover where you need to focus your remaining study time.
              </p>
            </div>
          </div>
          
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img 
              src="/images/practice-exam-screenshot.jpg" 
              alt="Practice Exam Example"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/600x338?text=Practice+Exam';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-4 text-white">
                <p className="font-medium">Realistic exam simulation with timing and scoring</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Practice Exam Features</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-1 mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">Authentic Test Experience</p>
                <p className="text-gray-600 text-sm">
                  Our practice exams mirror the actual test format, question types, and timing conditions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-1 mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">Detailed Performance Analysis</p>
                <p className="text-gray-600 text-sm">
                  After each exam, receive a comprehensive breakdown of your performance by topic, question type, and difficulty.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-1 mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">Answer Explanations</p>
                <p className="text-gray-600 text-sm">
                  Every question includes detailed explanations for both correct and incorrect answers, helping you learn from your mistakes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-1 mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">Score Prediction</p>
                <p className="text-gray-600 text-sm">
                  Get an estimated score for the actual exam based on your practice performance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mt-1 mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">Adaptive Difficulty</p>
                <p className="text-gray-600 text-sm">
                  As you improve, our practice exams adjust to include more challenging questions that target your growth areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Best Practices for Practice Exams</h3>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">1</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Simulate Test Conditions</p>
              <p className="text-gray-600">
                Take practice exams in a quiet environment, free from distractions. Follow the same timing rules as the actual test.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">2</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Complete Full Exams</p>
              <p className="text-gray-600">
                Take entire practice exams in one sitting to build stamina. Avoid pausing or breaking up the test.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">3</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Review Thoroughly</p>
              <p className="text-gray-600">
                After each practice exam, spend time reviewing every question, especially the ones you missed or guessed on.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">4</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Space Out Your Practice</p>
              <p className="text-gray-600">
                Schedule regular practice exams throughout your study period, not just in the final weeks before your test.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PracticeExamsStep; 