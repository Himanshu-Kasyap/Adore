const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create Express app for testing
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_community_platform_test';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test_jwt_secret_key';
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close database connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Protected Routes', () => {
    let authToken;
    let user;

    beforeEach(async () => {
      // Create and login a user to get auth token
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword
      });
      await user.save();

      authToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    });

    it('should allow access to protected routes with valid token', async () => {
      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(user._id.toString());
      expect(response.body.user.email).toBe(user.email);
    });

    it('should deny access to protected routes without token', async () => {
      const response = await request(app)
        .get('/api/user/bookings');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should deny access to protected routes with invalid token', async () => {
      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should deny access to protected routes with blacklisted token', async () => {
      // First logout to blacklist the token
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      // Try to access protected route with blacklisted token
      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TOKEN_BLACKLISTED');
    });
  });

  describe('Full Authentication Flow', () => {
    it('should complete full registration -> login -> access protected route flow', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      // Step 1: Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.token).toBeDefined();

      const token = registerResponse.body.data.token;

      // Step 2: Access protected route with registration token
      const protectedResponse = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body.success).toBe(true);
      expect(protectedResponse.body.user.email).toBe(userData.email);

      // Step 3: Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      const loginToken = loginResponse.body.data.token;

      // Step 4: Access protected route with login token
      const protectedResponse2 = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({ name: 'Updated Name' });

      expect(protectedResponse2.status).toBe(200);
      expect(protectedResponse2.body.success).toBe(true);
      expect(protectedResponse2.body.user.email).toBe(userData.email);

      // Step 5: Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Step 6: Try to access protected route after logout (should fail)
      const protectedResponse3 = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(protectedResponse3.status).toBe(401);
      expect(protectedResponse3.body.success).toBe(false);
      expect(protectedResponse3.body.error.code).toBe('TOKEN_BLACKLISTED');
    });
  });
});