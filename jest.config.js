/**
 * Jest Configuration for SmartFlowSite
 * Backend API testing with Node.js
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Keep Jest's cache inside the repo so Windows sandboxed runs do not write to AppData/Temp.
  cacheDirectory: '<rootDir>/.jest-cache',

  // SmartFlowSite has embedded app copies and backups; only test the root app.
  roots: ['<rootDir>/__tests__'],

  // File extensions
  moduleFileExtensions: ['js', 'json', 'node'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage settings
  collectCoverageFrom: [
    'server/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.config.js'
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Transform settings for ESM
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/.sfs-backups/',
    '/apps/',
    '/sfs-control/',
    '/.venv/'
  ],

  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/.sfs-backups/',
    '<rootDir>/node_modules/',
    '<rootDir>/apps/',
    '<rootDir>/sfs-control/',
    '<rootDir>/.venv/'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test timeout (10 seconds)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Maximum workers for parallel test execution
  maxWorkers: '50%'
};
