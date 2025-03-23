// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add polyfills for test environment
import { TextEncoder, TextDecoder } from 'util';

// Import jest-fetch-mock and configure
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Mock fetch API for test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Make URL available globally since it's used by MSW
global.URL = window.URL;

// Fix for MSW in Jest environment
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost/',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: ''
  }
});

// Silence the warnings from MSW and console errors during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out MSW warnings
  if (typeof args[0] === 'string' && args[0].includes('[MSW]')) {
    return;
  }
  originalConsoleWarn(...args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known network error messages during tests
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: An update to Component inside a test was not wrapped in act/.test(args[0]) ||
    /Network Error/.test(args[0]) ||
    /Error checking mini-assessment status/.test(args[0]) ||
    /Error confirming subscription/.test(args[0]) ||
    /Error fetching subscription status/.test(args[0]) ||
    (typeof args[0] === 'string' && args[0].includes('AggregateError'))
  ) {
    return;
  }
  originalConsoleError(...args);
}; 