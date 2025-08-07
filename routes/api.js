const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Import models
const Service = require('../models/Service');
const Product = require('../models/Product');
const News = require('../models/News');
const Contact = require('../models/Contact');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
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
  next();
};

// GET /api/services - Retrieve all active services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select('name description icon category')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch services',
        code: 'FETCH_SERVICES_ERROR'
      }
    });
  }
});

// GET /api/products - Retrieve products with search and filter capabilities
router.get('/products', [
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isIn(['food', 'clothing', 'tools', 'electronics', 'books', 'health', 'other']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('inStock').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, limit = 20, page = 1 } = req.query;
    
    // Build query object
    let query = {};
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Stock filter
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const products = await Product.find(query)
      .select('name description price image category inStock inventory')
      .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch products',
        code: 'FETCH_PRODUCTS_ERROR'
      }
    });
  }
});

// GET /api/news - Retrieve active news headlines
router.get('/news', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['general', 'health', 'agriculture', 'education', 'events', 'announcements'])
], handleValidationErrors, async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    // Build query object
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const news = await News.find(query)
      .select('title content publishDate category author')
      .sort({ publishDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch news',
        code: 'FETCH_NEWS_ERROR'
      }
    });
  }
});

// POST /api/contact - Submit contact form
router.post('/contact', [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim()
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contact = new Contact({
      name,
      email,
      message
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contact._id,
        name: contact.name,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit contact form',
        code: 'CONTACT_SUBMISSION_ERROR'
      }
    });
  }
});

module.exports = router;