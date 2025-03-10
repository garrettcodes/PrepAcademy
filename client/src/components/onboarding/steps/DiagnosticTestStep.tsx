import React, { useState } from 'react';

interface DiagnosticTestStepProps {
  onNext: () => void;
}

const DiagnosticTestStep: React.FC<DiagnosticTestStepProps> = ({ onNext }) => {
  const [activeTab, setActiveTab] = useState('what');
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Diagnostic Test</h2>
        <p className="text-gray-600 text-lg">
          The first step to improving is understanding where you stand.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('what')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'what'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            What is it?
          </button>
          <button
            onClick={() => setActiveTab('why')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'why'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Why take it?
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'how'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            How it works
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        {activeTab === 'what' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is a Diagnostic Test?</h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                A diagnostic test is a comprehensive assessment that helps identify your current skill level, strengths, and areas for improvement.
              </p>
              
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <img 
                  src="/images/diagnostic-test-screenshot.jpg" 
                  alt="Diagnostic Test Example"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/600x338?text=Diagnostic+Test';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-medium">Sample diagnostic questions analyze your skill level</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600">
                Our diagnostic test consists of carefully selected questions that cover all the major topics and question types you'll encounter on your actual exam.
              </p>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 text-sm font-medium">
                  The diagnostic test takes approximately 60-90 minutes to complete, but you can pause and resume at any time.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'why' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Take a Diagnostic Test?</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-green-100 text-green-700 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Personalized Study Plan</p>
                  <p className="text-gray-600">
                    The results from your diagnostic test are used to create a customized study plan that focuses on the areas where you need the most improvement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-green-100 text-green-700 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Efficient Learning</p>
                  <p className="text-gray-600">
                    By identifying your strengths and weaknesses, you can focus your study time more efficiently, rather than spending time on topics you already know well.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-green-100 text-green-700 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Progress Tracking</p>
                  <p className="text-gray-600">
                    The diagnostic test provides a baseline score that you can use to track your progress as you work through your study plan.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-green-100 text-green-700 rounded-full p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Realistic Experience</p>
                  <p className="text-gray-600">
                    Taking the diagnostic test familiarizes you with the format and types of questions you'll encounter on the actual exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'how' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How the Diagnostic Test Works</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">1</div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Take the Test</p>
                  <p className="text-gray-600">
                    Complete the diagnostic test, which includes questions from various topics and difficulty levels. Don't worry if you don't know all the answers - that's the point!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">2</div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">AI Analysis</p>
                  <p className="text-gray-600">
                    Our advanced algorithms analyze your responses to identify patterns in your performance, determining your strengths and areas for improvement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">3</div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Detailed Results</p>
                  <p className="text-gray-600">
                    Review your performance breakdown by topic, question type, and difficulty level, with insights into why you missed specific questions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center text-sm">4</div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium">Study Plan Generation</p>
                  <p className="text-gray-600">
                    Based on your results, we create a personalized study plan that targets your specific needs, with recommended practice materials and timelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default DiagnosticTestStep; 