import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PointsBadge from './ui/PointsBadge';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Check if a given route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-2xl font-bold text-primary">
                  PrepAcademy
                </Link>
              </div>
              
              {/* Desktop navigation */}
              <nav className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link
                  to="/study-plan"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/study-plan')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Study Plan
                </Link>
                
                <Link
                  to="/practice"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/practice')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Practice
                </Link>
                
                <Link
                  to="/exams"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/exams')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Exams
                </Link>
                
                <Link
                  to="/performance"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/performance')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Performance
                </Link>
              </nav>
            </div>
            
            {/* User profile dropdown */}
            <div className="hidden md:flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  {user?.points !== undefined && (
                    <PointsBadge points={user.points} />
                  )}
                  <div className="relative group">
                    <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>{user?.name}</span>
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMobileMenu}
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-primary"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/study-plan"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/study-plan')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Study Plan
              </Link>
              
              <Link
                to="/practice"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/practice')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Practice
              </Link>
              
              <Link
                to="/exams"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/exams')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Exams
              </Link>
              
              <Link
                to="/performance"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/performance')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Performance
              </Link>
              
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PrepAcademy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 