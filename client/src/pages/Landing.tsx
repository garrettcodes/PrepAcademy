import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <header className="relative bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-28">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
              Ace Your SAT & ACT Exams with PrepAcademy
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white opacity-90">
              Personalized test prep that adapts to your learning style and knowledge level, powered by AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">Get Started for Free</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="bg-white">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-4 text-center md:text-left">
              <Link to="/parent/login" className="text-white hover:text-blue-100 underline">
                Parent/Guardian Portal
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="text-white">
            <path
              fill="currentColor"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,186.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </header>

      {/* Features section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Features Designed for Your Success
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform adapts to your unique learning style to maximize your test scores.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Diagnostic Test</h3>
              <p className="mt-2 text-gray-600">
                Identify your strengths and weaknesses across all SAT/ACT subjects and determine your optimal learning style.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Adaptive Study Plan</h3>
              <p className="mt-2 text-gray-600">
                Get a personalized study roadmap that adapts to your progress, focusing on areas that need improvement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Practice Exams</h3>
              <p className="mt-2 text-gray-600">
                Take full-length, timed practice tests that simulate the real SAT/ACT experience with adaptive difficulty.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">AI Assistant</h3>
              <p className="mt-2 text-gray-600">
                Get personalized hints, explanations, and study recommendations tailored to your learning style.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Performance Tracking</h3>
              <p className="mt-2 text-gray-600">
                Monitor your progress with detailed analytics showing improvement over time across all subjects.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Unlimited Practice</h3>
              <p className="mt-2 text-gray-600">
                Access thousands of practice questions with detailed explanations tailored to your learning style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">
              Ready to Boost Your Test Scores?
            </h2>
            <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto">
              Join thousands of students who have improved their SAT and ACT scores with PrepAcademy.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button size="lg">Get Started for Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold">PrepAcademy</h3>
              <p className="mt-2 text-gray-400">
                Your path to higher test scores.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Log In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} PrepAcademy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 