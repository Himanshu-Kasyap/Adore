const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const router = express.Router();

// All user routes require authentication
router.use(auth);

// GET /api/user/bookings - Get user's booking history
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('products.productId', 'name price image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve bookings',
        code: 'BOOKINGS_FETCH_ERROR'
      }
    });
  }
});

// POST /api/user/bookings - Create new booking
router.post('/bookings', [
  body('products')
    .isArray({ min: 1 })
    .withMessage('Products array is required and must contain at least one item'),
  body('products.*.productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { products } = req.body;

    // Verify all products exist and are available
    const productIds = products.map(p => p.productId);
    const existingProducts = await Product.find({ 
      _id: { $in: productIds },
      inStock: true 
    });

    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'One or more products are not available',
          code: 'PRODUCTS_NOT_AVAILABLE'
        }
      });
    }

    // Create booking products with current prices
    const bookingProducts = products.map(orderProduct => {
      const product = existingProducts.find(p => p._id.toString() === orderProduct.productId);
      return {
        productId: orderProduct.productId,
        quantity: orderProduct.quantity,
        price: product.price
      };
    });

    // Create new booking
    const booking = new Booking({
      userId: req.user.userId,
      products: bookingProducts
    });

    await booking.save();

    // Populate product details for response
    await booking.populate('products.productId', 'name price image category');

    res.status(201).json({
      success: true,
      data: {
        booking,
        message: 'Booking created successfully'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create booking',
        code: 'BOOKING_CREATE_ERROR'
      }
    });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { name, phone, email } = req.body;
    const updateData = {};

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email is already registered to another account',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
      updateData.email = email;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: updatedUser.profile,
        message: 'Profile updated successfully'
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already registered to another account',
          code: 'EMAIL_ALREADY_EXISTS'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      }
    });
  }
});

module.exports = router;