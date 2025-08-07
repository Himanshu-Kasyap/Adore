require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');

// Import models
const Service = require('./models/Service');
const Product = require('./models/Product');
const News = require('./models/News');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Service.deleteMany({});
    await Product.deleteMany({});
    await News.deleteMany({});
    
    // Seed Services
    const services = [
      {
        name: 'Healthcare Services',
        description: 'Comprehensive medical care including checkups, vaccinations, and emergency services',
        icon: '/icons/healthcare.png',
        category: 'healthcare',
        isActive: true
      },
      {
        name: 'Educational Programs',
        description: 'Adult literacy programs, vocational training, and computer skills courses',
        icon: '/icons/education.png',
        category: 'education',
        isActive: true
      },
      {
        name: 'Agricultural Support',
        description: 'Farming guidance, seed distribution, and modern farming technique training',
        icon: '/icons/agriculture.png',
        category: 'agriculture',
        isActive: true
      },
      {
        name: 'Transportation Services',
        description: 'Community bus services and emergency transportation',
        icon: '/icons/transport.png',
        category: 'transportation',
        isActive: true
      },
      {
        name: 'Utility Services',
        description: 'Water supply, electricity maintenance, and waste management',
        icon: '/icons/utilities.png',
        category: 'utilities',
        isActive: true
      }
    ];
    
    await Service.insertMany(services);
    console.log('Services seeded successfully');
    
    // Seed Products
    const products = [
      {
        name: 'Organic Rice',
        description: 'Premium quality organic rice grown locally',
        price: 12.99,
        image: '/images/rice.jpg',
        category: 'food',
        inStock: true,
        inventory: 100
      },
      {
        name: 'Fresh Vegetables Bundle',
        description: 'Mixed seasonal vegetables from local farms',
        price: 8.50,
        image: '/images/vegetables.jpg',
        category: 'food',
        inStock: true,
        inventory: 50
      },
      {
        name: 'Handwoven Cotton Shirt',
        description: 'Traditional handwoven cotton shirt made by local artisans',
        price: 25.00,
        image: '/images/cotton-shirt.jpg',
        category: 'clothing',
        inStock: true,
        inventory: 30
      },
      {
        name: 'Farming Tools Set',
        description: 'Essential farming tools including hoe, spade, and sickle',
        price: 45.99,
        image: '/images/farming-tools.jpg',
        category: 'tools',
        inStock: true,
        inventory: 20
      },
      {
        name: 'Solar Lantern',
        description: 'Eco-friendly solar-powered lantern for rural lighting',
        price: 18.75,
        image: '/images/solar-lantern.jpg',
        category: 'electronics',
        inStock: true,
        inventory: 40
      },
      {
        name: 'Educational Books Set',
        description: 'Collection of educational books for children and adults',
        price: 22.50,
        image: '/images/books.jpg',
        category: 'books',
        inStock: true,
        inventory: 25
      },
      {
        name: 'Herbal Medicine Kit',
        description: 'Traditional herbal medicines for common ailments',
        price: 15.99,
        image: '/images/herbal-kit.jpg',
        category: 'health',
        inStock: false,
        inventory: 0
      }
    ];
    
    await Product.insertMany(products);
    console.log('Products seeded successfully');
    
    // Seed News
    const news = [
      {
        title: 'Community Health Camp This Weekend',
        content: 'Join us for a free health camp this Saturday and Sunday. Free checkups, vaccinations, and health consultations will be available for all community members.',
        publishDate: new Date(),
        category: 'health',
        author: 'Health Department',
        isActive: true
      },
      {
        title: 'New Agricultural Training Program Launched',
        content: 'We are excited to announce a new agricultural training program focusing on modern farming techniques and sustainable practices. Registration is now open.',
        publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        category: 'agriculture',
        author: 'Agricultural Office',
        isActive: true
      },
      {
        title: 'Community Center Renovation Complete',
        content: 'The community center renovation has been completed with new facilities including a computer lab, library, and meeting rooms.',
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        category: 'announcements',
        author: 'Community Board',
        isActive: true
      }
    ];
    
    await News.insertMany(news);
    console.log('News seeded successfully');
    
    console.log('All seed data inserted successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();