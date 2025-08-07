const mongoose = require('mongoose');
const { connectDB, checkConnection, closeConnection } = require('../../config/database');

describe('Database Connection', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and environment
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(async () => {
    // Clean up connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    // Restore original environment
    process.env = originalEnv;
  });

  describe('connectDB', () => {
    it('should connect to MongoDB successfully', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      const connection = await connectDB();
      
      expect(connection).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    it('should handle connection errors', async () => {
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test';
      
      // Mock console.error to avoid error output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(connectDB()).rejects.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should use connection options', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      const mongooseSpy = jest.spyOn(mongoose, 'connect');
      
      await connectDB();
      
      expect(mongooseSpy).toHaveBeenCalledWith(
        process.env.MONGODB_URI,
        expect.objectContaining({
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        })
      );
      
      mongooseSpy.mockRestore();
    });
  });

  describe('checkConnection', () => {
    it('should return true when connected', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      await connectDB();
      
      expect(checkConnection()).toBe(true);
    });

    it('should return false when not connected', () => {
      expect(checkConnection()).toBe(false);
    });
  });

  describe('closeConnection', () => {
    it('should close the database connection', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      await connectDB();
      expect(mongoose.connection.readyState).toBe(1); // Connected
      
      await closeConnection();
      expect(mongoose.connection.readyState).toBe(0); // Disconnected
    });

    it('should handle errors when closing connection', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock mongoose.connection.close to throw an error
      const closeSpy = jest.spyOn(mongoose.connection, 'close')
        .mockRejectedValue(new Error('Close error'));
      
      await closeConnection();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error closing database connection:', expect.any(Error));
      
      consoleSpy.mockRestore();
      closeSpy.mockRestore();
    });
  });

  describe('Connection Event Listeners', () => {
    it('should set up connection event listeners', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      await connectDB();
      
      // Trigger connected event
      mongoose.connection.emit('connected');
      expect(consoleSpy).toHaveBeenCalledWith('Mongoose connected to MongoDB');
      
      // Trigger disconnected event
      mongoose.connection.emit('disconnected');
      expect(consoleSpy).toHaveBeenCalledWith('Mongoose disconnected from MongoDB');
      
      consoleSpy.mockRestore();
    });

    it('should handle connection errors', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await connectDB();
      
      // Trigger error event
      const testError = new Error('Connection error');
      mongoose.connection.emit('error', testError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Mongoose connection error:', testError);
      
      consoleSpy.mockRestore();
    });
  });
});