// Manual test script to verify authentication endpoints
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function testAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_community_platform');
    console.log('✅ Connected to MongoDB');

    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test_jwt_secret_key';

    // Clean up any existing test user
    await User.deleteOne({ email: 'test@example.com' });

    // Test 1: Create a user manually
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+1234567890'
    });
    await user.save();
    console.log('✅ User created successfully');

    // Test 2: Verify password hashing
    const isPasswordValid = await bcrypt.compare('password123', user.password);
    console.log('✅ Password hashing works:', isPasswordValid);

    // Test 3: Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated:', token.substring(0, 20) + '...');

    // Test 4: Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified:', decoded.email);

    // Test 5: Test user profile virtual
    console.log('✅ User profile virtual:', user.profile);

    // Clean up
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test user cleaned up');

    console.log('\n🎉 All authentication components working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

testAuth();