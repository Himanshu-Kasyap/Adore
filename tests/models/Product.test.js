const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Product Model', () => {
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
    // Clear the Product collection before each test
    await Product.deleteMany({});
  });

  describe('Product Creation', () => {
    it('should create a valid product', async () => {
      const productData = {
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes from local farms',
        price: 5.99,
        image: '/images/tomatoes.jpg',
        category: 'food',
        inventory: 50
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.image).toBe(productData.image);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.inStock).toBe(true);
      expect(savedProduct.inventory).toBe(productData.inventory);
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });

    it('should create a product with minimal required fields', async () => {
      const productData = {
        name: 'Basic Product',
        price: 10.00
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.inStock).toBe(true);
      expect(savedProduct.inventory).toBe(0);
    });
  });

  describe('Product Validation', () => {
    it('should require name field', async () => {
      const productData = {
        price: 10.00
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Product name is required');
    });

    it('should require price field', async () => {
      const productData = {
        name: 'Test Product'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Price is required');
    });

    it('should validate minimum name length', async () => {
      const productData = {
        name: 'A',
        price: 10.00
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Product name must be at least 2 characters long');
    });

    it('should validate maximum name length', async () => {
      const productData = {
        name: 'A'.repeat(101),
        price: 10.00
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Product name cannot exceed 100 characters');
    });

    it('should validate maximum description length', async () => {
      const productData = {
        name: 'Valid Product',
        price: 10.00,
        description: 'A'.repeat(1001)
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Description cannot exceed 1000 characters');
    });

    it('should validate price is not negative', async () => {
      const productData = {
        name: 'Test Product',
        price: -5.00
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Price cannot be negative');
    });

    it('should validate price is a valid number', async () => {
      const productData = {
        name: 'Test Product',
        price: 'invalid-price'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });

    it('should validate category enum values', async () => {
      const productData = {
        name: 'Test Product',
        price: 10.00,
        category: 'invalid-category'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Category must be one of: food, clothing, tools, electronics, books, health, other');
    });

    it('should accept valid category values', async () => {
      const validCategories = ['food', 'clothing', 'tools', 'electronics', 'books', 'health', 'other'];
      
      for (const category of validCategories) {
        const productData = {
          name: `${category} Product`,
          price: 10.00,
          category: category
        };

        const product = new Product(productData);
        const savedProduct = await product.save();
        
        expect(savedProduct.category).toBe(category);
      }
    });

    it('should validate image URL format', async () => {
      const productData = {
        name: 'Test Product',
        price: 10.00,
        image: 'invalid-url'
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Image must be a valid URL or file path');
    });

    it('should validate inventory is not negative', async () => {
      const productData = {
        name: 'Test Product',
        price: 10.00,
        inventory: -5
      };

      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow('Inventory cannot be negative');
    });
  });

  describe('Product Virtual Fields', () => {
    it('should provide formattedPrice virtual field', async () => {
      const productData = {
        name: 'Test Product',
        price: 15.5
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.formattedPrice).toBe('$15.50');
    });

    it('should provide isAvailable virtual field', async () => {
      const productData1 = {
        name: 'Available Product',
        price: 10.00,
        inStock: true,
        inventory: 5
      };

      const productData2 = {
        name: 'Unavailable Product',
        price: 10.00,
        inStock: true,
        inventory: 0
      };

      const productData3 = {
        name: 'Out of Stock Product',
        price: 10.00,
        inStock: false,
        inventory: 5
      };

      const product1 = new Product(productData1);
      const savedProduct1 = await product1.save();
      expect(savedProduct1.isAvailable).toBe(true);

      const product2 = new Product(productData2);
      const savedProduct2 = await product2.save();
      expect(savedProduct2.isAvailable).toBe(false);

      const product3 = new Product(productData3);
      const savedProduct3 = await product3.save();
      expect(savedProduct3.isAvailable).toBe(false);
    });
  });

  describe('Product Queries', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        { name: 'Apple', price: 2.50, category: 'food', inStock: true, inventory: 10 },
        { name: 'T-Shirt', price: 15.00, category: 'clothing', inStock: true, inventory: 5 },
        { name: 'Hammer', price: 25.00, category: 'tools', inStock: false, inventory: 0 }
      ];

      await Product.insertMany(products);
    });

    it('should find products in stock', async () => {
      const inStockProducts = await Product.find({ inStock: true });
      expect(inStockProducts).toHaveLength(2);
    });

    it('should find products by category', async () => {
      const foodProducts = await Product.find({ category: 'food' });
      expect(foodProducts).toHaveLength(1);
      expect(foodProducts[0].name).toBe('Apple');
    });

    it('should find products by price range', async () => {
      const affordableProducts = await Product.find({ price: { $lte: 20 } });
      expect(affordableProducts).toHaveLength(2);
    });
  });
});