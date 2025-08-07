const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Product = require('../models/Product');

// Create Express app for testing
const express = require('express');
const cors = require('cors');
const userRoutes = require('../routes/user');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_community_platform_test';

describe('User Management API Tests', () => {
  let authToken;
  let user;
  let testProducts;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test_jwt_secret_key';
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Product.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '+1234567890'
    });
    await user.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create test products
    testProducts = await Product.insertMany([
      {
        name: 'Test Product 1',
        description: 'Test description 1',
        price: 10.99,
        category: 'food',
        inStock: true,
        inventory: 50
      },
      {
        name: 'Test Product 2',
        description: 'Test description 2',
        price: 25.50,
        category: 'tools',
        inStock: true,
        inventory: 20
      },
      {
        name: 'Out of Stock Product',
        description: 'Test description 3',
        price: 15.00,
        category: 'electronics',
        inStock: false,
        inventory: 0
      }
    ]);
  });

  afterAll(async () => {
    // Clean up and close database connection
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/user/bookings', () => {
    it('should return empty bookings array for user with no bookings', async () => {
      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    it('should return user bookings with populated product details', async () => {
      // Create test booking
      const booking = new Booking({
        userId: user._id,
        products: [
          {
            productId: testProducts[0]._id,
            quantity: 2,
            price: testProducts[0].price
          },
          {
            productId: testProducts[1]._id,
            quantity: 1,
            price: testProducts[1].price
          }
        ]
      });
      await booking.save();

      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.count).toBe(1);
      
      const returnedBooking = response.body.data.bookings[0];
      expect(returnedBooking.userId).toBe(user._id.toString());
      expect(returnedBooking.products).toHaveLength(2);
      expect(returnedBooking.products[0].productId.name).toBe('Test Product 1');
      expect(returnedBooking.products[1].productId.name).toBe('Test Product 2');
      expect(returnedBooking.totalAmount).toBeCloseTo(47.48, 2); // (10.99 * 2) + (25.50 * 1)
    });

    it('should return bookings sorted by creation date (newest first)', async () => {
      // Create multiple bookings with different timestamps
      const booking1 = new Booking({
        userId: user._id,
        products: [{
          productId: testProducts[0]._id,
          quantity: 1,
          price: testProducts[0].price
        }]
      });
      await booking1.save();

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const booking2 = new Booking({
        userId: user._id,
        products: [{
          productId: testProducts[1]._id,
          quantity: 1,
          price: testProducts[1].price
        }]
      });
      await booking2.save();

      const response = await request(app)
        .get('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.bookings).toHaveLength(2);
      
      // Check that bookings are sorted by creation date (newest first)
      const bookings = response.body.data.bookings;
      expect(new Date(bookings[0].createdAt).getTime())
        .toBeGreaterThan(new Date(bookings[1].createdAt).getTime());
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/user/bookings');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('POST /api/user/bookings', () => {
    it('should create a new booking with valid products', async () => {
      const bookingData = {
        products: [
          {
            productId: testProducts[0]._id.toString(),
            quantity: 2
          },
          {
            productId: testProducts[1]._id.toString(),
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.booking.userId).toBe(user._id.toString());
      expect(response.body.data.booking.products).toHaveLength(2);
      expect(response.body.data.booking.totalAmount).toBeCloseTo(47.48, 2); // (10.99 * 2) + (25.50 * 1)
      expect(response.body.data.booking.status).toBe('pending');
      expect(response.body.data.message).toBe('Booking created successfully');

      // Verify booking was saved to database
      const savedBooking = await Booking.findById(response.body.data.booking._id);
      expect(savedBooking).toBeTruthy();
      expect(savedBooking.userId.toString()).toBe(user._id.toString());
    });

    it('should reject booking with empty products array', async () => {
      const bookingData = {
        products: []
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject booking with invalid product ID', async () => {
      const bookingData = {
        products: [
          {
            productId: 'invalid_id',
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject booking with invalid quantity', async () => {
      const bookingData = {
        products: [
          {
            productId: testProducts[0]._id.toString(),
            quantity: 0
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject booking with non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const bookingData = {
        products: [
          {
            productId: nonExistentId.toString(),
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCTS_NOT_AVAILABLE');
    });

    it('should reject booking with out-of-stock product', async () => {
      const bookingData = {
        products: [
          {
            productId: testProducts[2]._id.toString(), // Out of stock product
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCTS_NOT_AVAILABLE');
    });

    it('should require authentication', async () => {
      const bookingData = {
        products: [
          {
            productId: testProducts[0]._id.toString(),
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/user/bookings')
        .send(bookingData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user name successfully', async () => {
      const updateData = {
        name: 'Jane Smith'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Jane Smith');
      expect(response.body.data.message).toBe('Profile updated successfully');

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe('Jane Smith');
    });

    it('should update user phone successfully', async () => {
      const updateData = {
        phone: '+9876543210'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.phone).toBe('+9876543210');

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.phone).toBe('+9876543210');
    });

    it('should update user email successfully', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newemail@example.com');

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe('newemail@example.com');
    });

    it('should update multiple fields simultaneously', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+1111111111',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Name');
      expect(response.body.data.user.phone).toBe('+1111111111');
      expect(response.body.data.user.email).toBe('updated@example.com');
    });

    it('should reject update with invalid name (too short)', async () => {
      const updateData = {
        name: 'A'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update with invalid phone number', async () => {
      const updateData = {
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update with invalid email', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update with email already taken by another user', async () => {
      // Create another user with a different email
      const hashedPassword = await bcrypt.hash('password123', 12);
      const anotherUser = new User({
        name: 'Another User',
        email: 'another@example.com',
        password: hashedPassword
      });
      await anotherUser.save();

      const updateData = {
        email: 'another@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should allow updating to same email (no change)', async () => {
      const updateData = {
        email: user.email // Same email
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should handle empty update (no fields provided)', async () => {
      const updateData = {};

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // User data should remain unchanged
      expect(response.body.data.user.name).toBe(user.name);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should require authentication', async () => {
      const updateData = {
        name: 'New Name'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });
});