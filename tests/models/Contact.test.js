const mongoose = require('mongoose');
const Contact = require('../../models/Contact');

describe('Contact Model', () => {
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
    // Clear the Contact collection before each test
    await Contact.deleteMany({});
  });

  describe('Contact Creation', () => {
    it('should create a valid contact', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message for the contact form.',
        priority: 'high'
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact._id).toBeDefined();
      expect(savedContact.name).toBe(contactData.name);
      expect(savedContact.email).toBe(contactData.email.toLowerCase());
      expect(savedContact.message).toBe(contactData.message);
      expect(savedContact.priority).toBe(contactData.priority);
      expect(savedContact.isRead).toBe(false);
      expect(savedContact.createdAt).toBeDefined();
      expect(savedContact.updatedAt).toBeDefined();
    });

    it('should create a contact without optional email field', async () => {
      const contactData = {
        name: 'Jane Doe',
        message: 'This is a message without email.'
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact._id).toBeDefined();
      expect(savedContact.name).toBe(contactData.name);
      expect(savedContact.message).toBe(contactData.message);
      expect(savedContact.email).toBeUndefined();
      expect(savedContact.priority).toBe('medium'); // default value
    });
  });

  describe('Contact Validation', () => {
    it('should require name field', async () => {
      const contactData = {
        message: 'Message without name'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Name is required');
    });

    it('should require message field', async () => {
      const contactData = {
        name: 'Test User'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Message is required');
    });

    it('should validate minimum name length', async () => {
      const contactData = {
        name: 'A',
        message: 'This is a valid message.'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Name must be at least 2 characters long');
    });

    it('should validate maximum name length', async () => {
      const contactData = {
        name: 'A'.repeat(51),
        message: 'This is a valid message.'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Name cannot exceed 50 characters');
    });

    it('should validate minimum message length', async () => {
      const contactData = {
        name: 'Test User',
        message: 'Short'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Message must be at least 10 characters long');
    });

    it('should validate maximum message length', async () => {
      const contactData = {
        name: 'Test User',
        message: 'A'.repeat(1001)
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Message cannot exceed 1000 characters');
    });

    it('should validate email format when provided', async () => {
      const contactData = {
        name: 'Test User',
        email: 'invalid-email',
        message: 'This is a valid message.'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Please enter a valid email address');
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      for (const email of validEmails) {
        const contactData = {
          name: 'Test User',
          email: email,
          message: 'This is a valid message.'
        };

        const contact = new Contact(contactData);
        const savedContact = await contact.save();
        
        expect(savedContact.email).toBe(email.toLowerCase());
      }
    });

    it('should validate priority enum values', async () => {
      const contactData = {
        name: 'Test User',
        message: 'This is a valid message.',
        priority: 'invalid-priority'
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow('Priority must be one of: low, medium, high');
    });

    it('should accept valid priority values', async () => {
      const validPriorities = ['low', 'medium', 'high'];
      
      for (const priority of validPriorities) {
        const contactData = {
          name: 'Test User',
          message: 'This is a valid message.',
          priority: priority
        };

        const contact = new Contact(contactData);
        const savedContact = await contact.save();
        
        expect(savedContact.priority).toBe(priority);
      }
    });
  });

  describe('Contact Virtual Fields', () => {
    it('should provide summary virtual field', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message.',
        priority: 'high'
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      const summary = savedContact.summary;
      expect(summary.id).toBeDefined();
      expect(summary.name).toBe(contactData.name);
      expect(summary.email).toBe(contactData.email.toLowerCase());
      expect(summary.isRead).toBe(false);
      expect(summary.priority).toBe(contactData.priority);
      expect(summary.createdAt).toBeDefined();
    });
  });

  describe('Contact Queries', () => {
    beforeEach(async () => {
      // Create test contacts
      const contacts = [
        { 
          name: 'John Doe', 
          email: 'john@example.com',
          message: 'This is an unread high priority message.',
          priority: 'high',
          isRead: false 
        },
        { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          message: 'This is a read medium priority message.',
          priority: 'medium',
          isRead: true 
        },
        { 
          name: 'Bob Johnson', 
          message: 'This is an unread low priority message without email.',
          priority: 'low',
          isRead: false 
        }
      ];

      await Contact.insertMany(contacts);
    });

    it('should find unread contacts', async () => {
      const unreadContacts = await Contact.find({ isRead: false });
      expect(unreadContacts).toHaveLength(2);
    });

    it('should find contacts by priority', async () => {
      const highPriorityContacts = await Contact.find({ priority: 'high' });
      expect(highPriorityContacts).toHaveLength(1);
      expect(highPriorityContacts[0].name).toBe('John Doe');
    });

    it('should find contacts sorted by creation date', async () => {
      const contacts = await Contact.find({}).sort({ createdAt: -1 });
      expect(contacts).toHaveLength(3);
      // Most recent first
      expect(contacts[0].name).toBe('Bob Johnson');
    });

    it('should find contacts with email addresses', async () => {
      const contactsWithEmail = await Contact.find({ email: { $exists: true, $ne: null } });
      expect(contactsWithEmail).toHaveLength(2);
    });
  });

  describe('Contact Updates', () => {
    it('should update isRead status', async () => {
      const contactData = {
        name: 'Test User',
        message: 'This is a test message.'
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact.isRead).toBe(false);

      savedContact.isRead = true;
      const updatedContact = await savedContact.save();

      expect(updatedContact.isRead).toBe(true);
      expect(updatedContact.updatedAt).not.toEqual(updatedContact.createdAt);
    });
  });
});