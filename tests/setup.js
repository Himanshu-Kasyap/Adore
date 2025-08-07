const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Ensure we're using a test database
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.includes('test')) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
  }
});

// Global test teardown
afterAll(async () => {
  // Close all mongoose connections
  await mongoose.disconnect();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});