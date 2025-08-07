const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/rural_community_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the User collection before each test
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should create a user without optional phone field', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.phone).toBeUndefined();
    });
  });

  describe('User Validation', () => {
    it('should require name field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Name is required');
    });

    it('should require email field', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Email is required');
    });

    it('should require password field', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Password is required');
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Please enter a valid email');
    });

    it('should validate phone format', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: 'invalid-phone'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Please enter a valid phone number');
    });

    it('should validate minimum password length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should validate minimum name length', async () => {
      const userData = {
        name: 'A',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('should validate maximum name length', async () => {
      const userData = {
        name: 'A'.repeat(51),
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Name cannot exceed 50 characters');
    });

    it('should enforce unique email constraint', async () => {
      const userData1 = {
        name: 'User One',
        email: 'same@example.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'User Two',
        email: 'same@example.com',
        password: 'password456'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow(/duplicate key error/);
    });
  });

  describe('User Virtual Fields', () => {
    it('should provide profile virtual field', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const profile = savedUser.profile;
      expect(profile.id).toBeDefined();
      expect(profile.name).toBe(userData.name);
      expect(profile.email).toBe(userData.email);
      expect(profile.phone).toBe(userData.phone);
      expect(profile.createdAt).toBeDefined();
    });

    it('should exclude password from JSON output', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const jsonOutput = JSON.parse(JSON.stringify(savedUser));
      expect(jsonOutput.password).toBeUndefined();
      expect(jsonOutput.name).toBe(userData.name);
      expect(jsonOutput.email).toBe(userData.email);
    });
  });
});