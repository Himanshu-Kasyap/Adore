const mongoose = require('mongoose');
const { connectDB, closeConnection } = require('./config/database');

// Import all models
const User = require('./models/User');
const Service = require('./models/Service');
const Product = require('./models/Product');
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');
const News = require('./models/News');

async function testModels() {
  try {
    // Set test environment
    process.env.MONGODB_URI = 'mongodb://localhost:27017/rural_community_test';
    
    console.log('Connecting to test database...');
    await connectDB();
    
    console.log('Testing models...');
    
    // Test User model
    console.log('✓ Testing User model...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890'
    });
    const savedUser = await user.save();
    console.log('  ✓ User created successfully');
    
    // Test Service model
    console.log('✓ Testing Service model...');
    const service = new Service({
      name: 'Healthcare Service',
      description: 'Comprehensive healthcare services',
      category: 'healthcare',
      icon: '/icons/healthcare.png'
    });
    const savedService = await service.save();
    console.log('  ✓ Service created successfully');
    
    // Test Product model
    console.log('✓ Testing Product model...');
    const product = new Product({
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes',
      price: 5.99,
      category: 'food',
      inventory: 50
    });
    const savedProduct = await product.save();
    console.log('  ✓ Product created successfully');
    
    // Test Booking model
    console.log('✓ Testing Booking model...');
    const booking = new Booking({
      userId: savedUser._id,
      products: [{
        productId: savedProduct._id,
        quantity: 2,
        price: 5.99
      }]
    });
    const savedBooking = await booking.save();
    console.log('  ✓ Booking created successfully');
    console.log('  ✓ Total amount calculated:', savedBooking.totalAmount);
    
    // Test Contact model
    console.log('✓ Testing Contact model...');
    const contact = new Contact({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test contact message.',
      priority: 'medium'
    });
    const savedContact = await contact.save();
    console.log('  ✓ Contact created successfully');
    
    // Test News model
    console.log('✓ Testing News model...');
    const news = new News({
      title: 'Community Health Fair Announcement',
      content: 'The annual health fair will be held next month.',
      category: 'health',
      author: 'Dr. Smith'
    });
    const savedNews = await news.save();
    console.log('  ✓ News created successfully');
    
    // Test virtual fields
    console.log('✓ Testing virtual fields...');
    console.log('  ✓ User profile:', savedUser.profile.name);
    console.log('  ✓ Product formatted price:', savedProduct.formattedPrice);
    console.log('  ✓ Product availability:', savedProduct.isAvailable);
    console.log('  ✓ Booking total items:', savedBooking.totalItems);
    console.log('  ✓ News preview:', savedNews.preview.substring(0, 50) + '...');
    
    // Test population
    console.log('✓ Testing population...');
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name price');
    console.log('  ✓ Populated user name:', populatedBooking.userId.name);
    console.log('  ✓ Populated product name:', populatedBooking.products[0].productId.name);
    
    console.log('\n🎉 All models tested successfully!');
    
    // Clean up test data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Contact.deleteMany({});
    await News.deleteMany({});
    
    console.log('✓ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
}

// Run the test
testModels();