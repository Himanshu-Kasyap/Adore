const mongoose = require('mongoose');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Product = require('../../models/Product');

describe('Booking Model', () => {
  let testUser, testProduct1, testProduct2;

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
    // Clear collections before each test
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create test user and products
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    testProduct1 = await Product.create({
      name: 'Test Product 1',
      price: 10.00,
      category: 'food'
    });

    testProduct2 = await Product.create({
      name: 'Test Product 2',
      price: 15.50,
      category: 'tools'
    });
  });

  describe('Booking Creation', () => {
    it('should create a valid booking', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 2,
            price: 10.00
          },
          {
            productId: testProduct2._id,
            quantity: 1,
            price: 15.50
          }
        ]
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.userId.toString()).toBe(testUser._id.toString());
      expect(savedBooking.products).toHaveLength(2);
      expect(savedBooking.products[0].productId.toString()).toBe(testProduct1._id.toString());
      expect(savedBooking.products[0].quantity).toBe(2);
      expect(savedBooking.products[0].price).toBe(10.00);
      expect(savedBooking.totalAmount).toBe(35.50); // (10 * 2) + (15.50 * 1)
      expect(savedBooking.status).toBe('pending');
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
    });

    it('should create a booking with single product', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 3,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking.products).toHaveLength(1);
      expect(savedBooking.totalAmount).toBe(30.00);
    });
  });

  describe('Booking Validation', () => {
    it('should require userId field', async () => {
      const bookingData = {
        products: [
          {
            productId: testProduct1._id,
            quantity: 1,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('User ID is required');
    });

    it('should validate userId is a valid ObjectId', async () => {
      const bookingData = {
        userId: 'invalid-id',
        products: [
          {
            productId: testProduct1._id,
            quantity: 1,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow(/Cast to ObjectId failed/);
    });

    it('should require at least one product', async () => {
      const bookingData = {
        userId: testUser._id,
        products: []
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Booking must contain at least one product');
    });

    it('should require productId in products', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            quantity: 1,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Product ID is required');
    });

    it('should validate productId is a valid ObjectId', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: 'invalid-id',
            quantity: 1,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow(/Cast to ObjectId failed/);
    });

    it('should require quantity in products', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Quantity is required');
    });

    it('should validate quantity is at least 1', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 0,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Quantity must be at least 1');
    });

    it('should validate quantity is a whole number', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 1.5,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Quantity must be a whole number');
    });

    it('should require price in products', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 1
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Price is required');
    });

    it('should validate price is not negative', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 1,
            price: -5.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Price cannot be negative');
    });

    it('should validate status enum values', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 1,
            price: 10.00
          }
        ],
        status: 'invalid-status'
      };

      const booking = new Booking(bookingData);
      
      await expect(booking.save()).rejects.toThrow('Status must be one of: pending, confirmed, completed, cancelled');
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      
      for (const status of validStatuses) {
        const bookingData = {
          userId: testUser._id,
          products: [
            {
              productId: testProduct1._id,
              quantity: 1,
              price: 10.00
            }
          ],
          status: status
        };

        const booking = new Booking(bookingData);
        const savedBooking = await booking.save();
        
        expect(savedBooking.status).toBe(status);
      }
    });
  });

  describe('Booking Virtual Fields and Methods', () => {
    it('should calculate totalItems virtual field', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 2,
            price: 10.00
          },
          {
            productId: testProduct2._id,
            quantity: 3,
            price: 15.50
          }
        ]
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking.totalItems).toBe(5); // 2 + 3
    });

    it('should provide summary virtual field', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 2,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      const summary = savedBooking.summary;
      expect(summary.id).toBeDefined();
      expect(summary.totalAmount).toBe(20.00);
      expect(summary.totalItems).toBe(2);
      expect(summary.status).toBe('pending');
      expect(summary.createdAt).toBeDefined();
    });

    it('should auto-calculate totalAmount on save', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 2,
            price: 10.00
          },
          {
            productId: testProduct2._id,
            quantity: 1,
            price: 15.50
          }
        ],
        totalAmount: 0 // This should be overridden
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking.totalAmount).toBe(35.50); // (10 * 2) + (15.50 * 1)
    });
  });

  describe('Booking Population', () => {
    it('should populate user and product references', async () => {
      const bookingData = {
        userId: testUser._id,
        products: [
          {
            productId: testProduct1._id,
            quantity: 1,
            price: 10.00
          }
        ]
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      const populatedBooking = await Booking.findById(savedBooking._id)
        .populate('userId', 'name email')
        .populate('products.productId', 'name price category');

      expect(populatedBooking.userId.name).toBe('Test User');
      expect(populatedBooking.userId.email).toBe('test@example.com');
      expect(populatedBooking.products[0].productId.name).toBe('Test Product 1');
      expect(populatedBooking.products[0].productId.price).toBe(10.00);
    });
  });
});