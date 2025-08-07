const request = require('supertest');
const mongoose = require('mongoose');

// Set test environment before importing app
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';

const app = require('../server');

// Import models for test data setup
const Service = require('../models/Service');
const Product = require('../models/Product');
const News = require('../models/News');
const Contact = require('../models/Contact');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await Service.deleteMany({});
    await Product.deleteMany({});
    await News.deleteMany({});
    await Contact.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/services', () => {
    beforeEach(async () => {
      // Create test services
      await Service.create([
        {
          name: 'Healthcare',
          description: 'Medical services for the community',
          icon: '/icons/healthcare.png',
          category: 'healthcare',
          isActive: true
        },
        {
          name: 'Education',
          description: 'Educational programs and resources',
          icon: '/icons/education.png',
          category: 'education',
          isActive: true
        },
        {
          name: 'Inactive Service',
          description: 'This service is not active',
          icon: '/icons/inactive.png',
          category: 'other',
          isActive: false
        }
      ]);
    });

    it('should return all active services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('description');
      expect(response.body.data[0]).toHaveProperty('icon');
      expect(response.body.data[0]).toHaveProperty('category');
    });

    it('should return services sorted by name', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.data[0].name).toBe('Education');
      expect(response.body.data[1].name).toBe('Healthcare');
    });

    it('should not return inactive services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      const serviceNames = response.body.data.map(service => service.name);
      expect(serviceNames).not.toContain('Inactive Service');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create([
        {
          name: 'Organic Apples',
          description: 'Fresh organic apples from local farms',
          price: 5.99,
          image: '/images/apples.jpg',
          category: 'food',
          inStock: true,
          inventory: 50
        },
        {
          name: 'Cotton T-Shirt',
          description: 'Comfortable cotton t-shirt',
          price: 15.99,
          image: '/images/tshirt.jpg',
          category: 'clothing',
          inStock: true,
          inventory: 25
        },
        {
          name: 'Expensive Item',
          description: 'Very expensive product',
          price: 199.99,
          image: '/images/expensive.jpg',
          category: 'electronics',
          inStock: false,
          inventory: 0
        }
      ]);
    });

    it('should return all products with default pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('totalPages', 1);
      expect(response.body.pagination).toHaveProperty('totalCount', 3);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=food')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Organic Apples');
      expect(response.body.data[0].category).toBe('food');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=10&maxPrice=20')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Cotton T-Shirt');
      expect(response.body.data[0].price).toBe(15.99);
    });

    it('should filter products by stock status', async () => {
      const response = await request(app)
        .get('/api/products?inStock=true')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(product => {
        expect(product.inStock).toBe(true);
      });
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?limit=2&page=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNext).toBe(true);
      expect(response.body.pagination.hasPrev).toBe(false);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/products?category=invalid&minPrice=-5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/news', () => {
    beforeEach(async () => {
      // Create test news
      await News.create([
        {
          title: 'Community Health Fair Next Week',
          content: 'Join us for a community health fair with free checkups and health screenings.',
          publishDate: new Date('2024-01-15'),
          category: 'health',
          author: 'Health Department',
          isActive: true
        },
        {
          title: 'New Agricultural Program Launched',
          content: 'We are excited to announce a new agricultural support program for local farmers.',
          publishDate: new Date('2024-01-10'),
          category: 'agriculture',
          author: 'Agricultural Office',
          isActive: true
        },
        {
          title: 'Inactive News',
          content: 'This news item is not active',
          publishDate: new Date('2024-01-05'),
          category: 'general',
          author: 'Admin',
          isActive: false
        }
      ]);
    });

    it('should return active news sorted by publish date', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      
      // Should be sorted by publishDate descending
      expect(response.body.data[0].title).toBe('Community Health Fair Next Week');
      expect(response.body.data[1].title).toBe('New Agricultural Program Launched');
    });

    it('should filter news by category', async () => {
      const response = await request(app)
        .get('/api/news?category=health')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('health');
      expect(response.body.data[0].title).toBe('Community Health Fair Next Week');
    });

    it('should limit news results', async () => {
      const response = await request(app)
        .get('/api/news?limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
    });

    it('should not return inactive news', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      const newsTitles = response.body.data.map(news => news.title);
      expect(newsTitles).not.toContain('Inactive News');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/news?category=invalid&limit=100')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/contact', () => {
    it('should create a contact submission successfully', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message for the contact form.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contact form submitted successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'John Doe');
      expect(response.body.data).toHaveProperty('createdAt');

      // Verify the contact was saved to database
      const savedContact = await Contact.findById(response.body.data.id);
      expect(savedContact).toBeTruthy();
      expect(savedContact.name).toBe('John Doe');
      expect(savedContact.email).toBe('john@example.com');
      expect(savedContact.message).toBe('This is a test message for the contact form.');
    });

    it('should create contact without email', async () => {
      const contactData = {
        name: 'Jane Doe',
        message: 'This is a test message without email.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Jane Doe');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Name is required' }),
          expect.objectContaining({ msg: 'Message is required' })
        ])
      );
    });

    it('should validate name length', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'A',
          message: 'This is a valid message.'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Name must be between 2 and 50 characters' })
        ])
      );
    });

    it('should validate message length', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'John Doe',
          message: 'Short'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Message must be between 10 and 1000 characters' })
        ])
      );
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          message: 'This is a valid message.'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Please provide a valid email address' })
        ])
      );
    });
  });
});