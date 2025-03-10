import React from 'react';

interface StudyPlanStepProps {
  onNext: () => void;
}

const StudyPlanStep: React.FC<StudyPlanStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Personalized Study Plan</h2>
        <p className="text-gray-600 text-lg">
          The key to success is a structured approach to your studies.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center mb-8">
          <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img 
                src="/images/study-plan-screenshot.jpg" 
                alt="Study Plan Example"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400?text=Study+Plan';
                }}
              />
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is a Study Plan?</h3>
            <p className="text-gray-600 mb-4">
              Your study plan is a personalized roadmap that guides you through your test preparation journey. Based on your diagnostic test results and goals, we create a tailored schedule of study sessions, practice materials, and assessments to maximize your improvement.
            </p>
            <p className="text-gray-600">
              The study plan adapts to your progress, adjusting to focus more on areas where you need extra help and accelerating through topics you've mastered.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Features of Your Study Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800">Daily Study Tasks</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Clear, actionable daily tasks that break down your study goals into manageable chunks, ensuring consistent progress.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800">Progress Tracking</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Visual indicators of your progress through each topic, helping you stay motivated and see your improvement over time.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800">Adaptive Learning</h4>
              </div>
              <p className="text-gray-600 text-sm">
                The plan continuously adapts based on your performance, spending more time on challenging areas and less on concepts you've mastered.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800">Targeted Resources</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Curated study materials, practice questions, and video lessons that specifically address your needs and learning style.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Use Your Study Plan</h3>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">1</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Check Your Daily Tasks</p>
              <p className="text-gray-600">
                Begin each study session by reviewing your assigned tasks for the day. These tasks are strategically designed to build your skills incrementally.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">2</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Complete Study Materials</p>
              <p className="text-gray-600">
                Work through the assigned lessons, videos, and practice questions. Take your time to thoroughly understand each concept before moving on.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">3</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Take Mini-Assessments</p>
              <p className="text-gray-600">
                Regular mini-assessments will check your understanding and help the system adapt your plan. These are crucial for optimizing your study path.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">4</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Review Your Progress</p>
              <p className="text-gray-600">
                Periodically review your progress charts to see how far you've come and where you still need to focus your efforts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">5</div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Stay Consistent</p>
              <p className="text-gray-600">
                Consistency is key to success. Even short, regular study sessions are more effective than occasional long cramming sessions.
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
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default StudyPlanStep; 