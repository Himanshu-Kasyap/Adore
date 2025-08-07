const mongoose = require('mongoose');
const Service = require('../../models/Service');

describe('Service Model', () => {
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
    // Clear the Service collection before each test
    await Service.deleteMany({});
  });

  describe('Service Creation', () => {
    it('should create a valid service', async () => {
      const serviceData = {
        name: 'Healthcare Service',
        description: 'Comprehensive healthcare services for rural communities',
        icon: '/icons/healthcare.png',
        category: 'healthcare'
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      expect(savedService._id).toBeDefined();
      expect(savedService.name).toBe(serviceData.name);
      expect(savedService.description).toBe(serviceData.description);
      expect(savedService.icon).toBe(serviceData.icon);
      expect(savedService.category).toBe(serviceData.category);
      expect(savedService.isActive).toBe(true);
      expect(savedService.createdAt).toBeDefined();
      expect(savedService.updatedAt).toBeDefined();
    });

    it('should create a service with minimal required fields', async () => {
      const serviceData = {
        name: 'Basic Service'
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      expect(savedService._id).toBeDefined();
      expect(savedService.name).toBe(serviceData.name);
      expect(savedService.isActive).toBe(true);
    });
  });

  describe('Service Validation', () => {
    it('should require name field', async () => {
      const serviceData = {
        description: 'Service without name'
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Service name is required');
    });

    it('should validate minimum name length', async () => {
      const serviceData = {
        name: 'A'
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Service name must be at least 2 characters long');
    });

    it('should validate maximum name length', async () => {
      const serviceData = {
        name: 'A'.repeat(101)
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Service name cannot exceed 100 characters');
    });

    it('should validate maximum description length', async () => {
      const serviceData = {
        name: 'Valid Service',
        description: 'A'.repeat(501)
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Description cannot exceed 500 characters');
    });

    it('should validate category enum values', async () => {
      const serviceData = {
        name: 'Test Service',
        category: 'invalid-category'
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Category must be one of: healthcare, education, agriculture, transportation, utilities, other');
    });

    it('should accept valid category values', async () => {
      const validCategories = ['healthcare', 'education', 'agriculture', 'transportation', 'utilities', 'other'];
      
      for (const category of validCategories) {
        const serviceData = {
          name: `${category} Service`,
          category: category
        };

        const service = new Service(serviceData);
        const savedService = await service.save();
        
        expect(savedService.category).toBe(category);
      }
    });

    it('should validate icon URL format', async () => {
      const serviceData = {
        name: 'Test Service',
        icon: 'invalid-url'
      };

      const service = new Service(serviceData);
      
      await expect(service.save()).rejects.toThrow('Icon must be a valid URL or file path');
    });

    it('should accept valid icon URLs', async () => {
      const validIcons = [
        'https://example.com/icon.png',
        'http://example.com/icon.jpg',
        '/icons/service.png',
        '/path/to/icon.svg'
      ];

      for (const icon of validIcons) {
        const serviceData = {
          name: `Service ${icon}`,
          icon: icon
        };

        const service = new Service(serviceData);
        const savedService = await service.save();
        
        expect(savedService.icon).toBe(icon);
      }
    });
  });

  describe('Service Virtual Fields', () => {
    it('should provide summary virtual field', async () => {
      const serviceData = {
        name: 'Test Service',
        description: 'Test description',
        category: 'healthcare'
      };

      const service = new Service(serviceData);
      const savedService = await service.save();

      const summary = savedService.summary;
      expect(summary.id).toBeDefined();
      expect(summary.name).toBe(serviceData.name);
      expect(summary.category).toBe(serviceData.category);
      expect(summary.isActive).toBe(true);
    });
  });

  describe('Service Queries', () => {
    beforeEach(async () => {
      // Clear any existing data first
      await Service.deleteMany({});
      
      // Create test services
      const services = [
        { name: 'Healthcare Service', category: 'healthcare', isActive: true },
        { name: 'Education Service', category: 'education', isActive: true },
        { name: 'Inactive Service', category: 'other', isActive: false }
      ];

      await Service.insertMany(services);
    });

    it('should find active services', async () => {
      const activeServices = await Service.find({ isActive: true });
      expect(activeServices).toHaveLength(2);
    });

    it('should find services by category', async () => {
      const healthcareServices = await Service.find({ category: 'healthcare' });
      expect(healthcareServices).toHaveLength(1);
      expect(healthcareServices[0].name).toBe('Healthcare Service');
    });
  });
});