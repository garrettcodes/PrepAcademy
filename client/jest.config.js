module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testTimeout: 10000
}; 