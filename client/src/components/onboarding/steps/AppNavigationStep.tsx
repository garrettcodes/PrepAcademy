import React from 'react';

interface AppNavigationStepProps {
  onNext: () => void;
}

const AppNavigationStep: React.FC<AppNavigationStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Navigating PrepAcademy</h2>
        <p className="text-gray-600 text-lg">
          Learn how to efficiently navigate the app to access all features.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Main Navigation Areas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800">Dashboard</h4>
            </div>
            <p className="text-gray-600">
              Your personalized home screen displays your study plan, upcoming tasks, progress summary, and quick access to key features. Access it by clicking the "Dashboard" link in the sidebar or the app logo.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800">Study Plan</h4>
            </div>
            <p className="text-gray-600">
              Access your personalized study plan by clicking "Study Plan" in the sidebar. Here you'll find daily tasks, recommended materials, and progress tracking for each study area.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800">Practice Section</h4>
            </div>
            <p className="text-gray-600">
              Find targeted practice questions and full-length practice exams in the "Practice" section. You can filter questions by topic, difficulty, and question type to focus on specific areas.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800">Performance Tracking</h4>
            </div>
            <p className="text-gray-600">
              Monitor your progress in the "Performance" section, where you'll find detailed analytics on your strengths, weaknesses, and improvement over time across all test subjects.
            </p>
          </div>
        </div>
        
        <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
          <img 
            src="/images/app-navigation-screenshot.jpg" 
            alt="App Navigation"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/600x338?text=App+Navigation';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              <p className="font-medium">The intuitive sidebar navigation makes it easy to access all features</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Features & Navigation Tips</h3>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-indigo-100 text-indigo-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Calendar & Scheduling</p>
              <p className="text-gray-600 text-sm">
                Access your study calendar by clicking the calendar icon in the top navigation bar. Here you can view scheduled study sessions, upcoming assessments, and important deadlines.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-indigo-100 text-indigo-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Notifications</p>
              <p className="text-gray-600 text-sm">
                Click the bell icon in the top navigation to view notifications about upcoming assignments, test dates, new available practice materials, and achievement badges.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-indigo-100 text-indigo-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Settings & Profile</p>
              <p className="text-gray-600 text-sm">
                Click your profile icon in the top-right corner to access your profile settings, notification preferences, privacy settings, and account information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-indigo-100 text-indigo-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Offline Mode</p>
              <p className="text-gray-600 text-sm">
                PrepAcademy works even without an internet connection. Downloaded materials and practice questions are available offline, and your progress will sync when you reconnect.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-indigo-100 text-indigo-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-gray-700 font-medium">Help & Resources</p>
              <p className="text-gray-600 text-sm">
                Access help documentation, video tutorials, and contact support by clicking the "Help" icon in the sidebar or footer menu. Our support team is available to assist you with any questions.
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

export default AppNavigationStep; 