import React from 'react';

interface ProgressTrackingStepProps {
  onNext: () => void;
}

const ProgressTrackingStep: React.FC<ProgressTrackingStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tracking Your Progress</h2>
        <p className="text-gray-600 text-lg">
          See how PrepAcademy helps you monitor your improvement and stay on track.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Why Progress Tracking Matters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Stay Motivated</h4>
            <p className="text-gray-600 text-sm">
              Seeing your progress helps maintain motivation and momentum throughout your preparation.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Identify Patterns</h4>
            <p className="text-gray-600 text-sm">
              Recognize patterns in your performance to better understand your learning style and habits.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-purple-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Build Confidence</h4>
            <p className="text-gray-600 text-sm">
              Gain confidence as you see measurable improvements in your skills and knowledge over time.
            </p>
          </div>
        </div>
        
        <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
          <img 
            src="/images/progress-tracking-screenshot.jpg" 
            alt="Progress Tracking Dashboard"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/600x338?text=Progress+Tracking';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              <p className="font-medium">Detailed analytics help you understand your strengths and weaknesses</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress Tracking Features</h3>
        
        <div className="space-y-6">
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1 mr-4">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-8 w-8 flex items-center justify-center text-xl">1</div>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-lg">Performance Dashboard</p>
              <p className="text-gray-600 mt-1">
                Your personal dashboard provides a comprehensive overview of your study progress, including:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside ml-2">
                <li>Overall test readiness score</li>
                <li>Subject-by-subject breakdown of strengths and weaknesses</li>
                <li>Recent activity and test results</li>
                <li>Study time tracking and consistency metrics</li>
                <li>Upcoming assignments and recommended focus areas</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1 mr-4">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-8 w-8 flex items-center justify-center text-xl">2</div>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-lg">Detailed Analytics</p>
              <p className="text-gray-600 mt-1">
                Dive deeper into your performance with detailed analytics that show:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside ml-2">
                <li>Question-type analysis (which types you excel at vs. struggle with)</li>
                <li>Time management metrics (how quickly you answer different question types)</li>
                <li>Topic mastery levels (beginner, intermediate, advanced, mastery)</li>
                <li>Historical performance trends over time</li>
                <li>Comparison to target score requirements</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1 mr-4">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-8 w-8 flex items-center justify-center text-xl">3</div>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-lg">Goal Tracking</p>
              <p className="text-gray-600 mt-1">
                Set and monitor progress toward specific goals:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside ml-2">
                <li>Target score tracking with likelihood of achievement</li>
                <li>Custom subject-specific goals and milestones</li>
                <li>Study consistency goals and streaks</li>
                <li>Visual progress bars for each goal</li>
                <li>Notifications and celebrations when goals are achieved</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1 mr-4">
              <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-8 w-8 flex items-center justify-center text-xl">4</div>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-lg">Gamification Elements</p>
              <p className="text-gray-600 mt-1">
                Stay motivated with engaging game-like elements:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 list-disc list-inside ml-2">
                <li>Achievement badges for reaching milestones</li>
                <li>Points system that rewards consistent study habits</li>
                <li>Leaderboards to compare progress with peers (optional)</li>
                <li>Challenges to tackle specific skills or topics</li>
                <li>Streaks and rewards for maintaining study consistency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Making the Most of Progress Tracking</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1 mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Check your dashboard regularly</p>
              <p className="text-gray-600 text-sm">
                Make it a habit to review your progress dashboard at least once a week to stay aware of your progress and areas needing attention.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1 mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Set realistic, incremental goals</p>
              <p className="text-gray-600 text-sm">
                Break down your main target score into smaller, achievable goals that you can track and celebrate along the way.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1 mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Use the detailed analytics</p>
              <p className="text-gray-600 text-sm">
                Don't just look at overall scores; dive into the detailed analytics to understand the specific patterns in your performance.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1 mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Adjust your strategy based on data</p>
              <p className="text-gray-600 text-sm">
                Use the insights from your progress tracking to adjust your study plan and focus more time on areas where you're not seeing improvement.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1 mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Celebrate your achievements</p>
              <p className="text-gray-600 text-sm">
                Take time to acknowledge and celebrate your progress and achievements, no matter how small they may seem.
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
          Complete Onboarding
        </button>
      </div>
    </div>
  );
};

export default ProgressTrackingStep; 