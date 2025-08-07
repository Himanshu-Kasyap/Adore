const mongoose = require('mongoose');
const News = require('../../models/News');

describe('News Model', () => {
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
    // Clear the News collection before each test
    await News.deleteMany({});
  });

  describe('News Creation', () => {
    it('should create a valid news article', async () => {
      const newsData = {
        title: 'Community Health Fair Scheduled',
        content: 'The annual community health fair will be held next month at the town center. Free health screenings and consultations will be available.',
        category: 'health',
        author: 'Dr. Smith'
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      expect(savedNews._id).toBeDefined();
      expect(savedNews.title).toBe(newsData.title);
      expect(savedNews.content).toBe(newsData.content);
      expect(savedNews.category).toBe(newsData.category);
      expect(savedNews.author).toBe(newsData.author);
      expect(savedNews.isActive).toBe(true);
      expect(savedNews.publishDate).toBeDefined();
      expect(savedNews.createdAt).toBeDefined();
      expect(savedNews.updatedAt).toBeDefined();
    });

    it('should create a news article with minimal required fields', async () => {
      const newsData = {
        title: 'Simple News Title'
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      expect(savedNews._id).toBeDefined();
      expect(savedNews.title).toBe(newsData.title);
      expect(savedNews.category).toBe('general'); // default value
      expect(savedNews.isActive).toBe(true);
      expect(savedNews.publishDate).toBeDefined();
    });

    it('should set publishDate to current date by default', async () => {
      const newsData = {
        title: 'Test News Article'
      };

      const beforeCreate = new Date();
      const news = new News(newsData);
      const savedNews = await news.save();
      const afterCreate = new Date();

      expect(savedNews.publishDate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(savedNews.publishDate.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('News Validation', () => {
    it('should require title field', async () => {
      const newsData = {
        content: 'Content without title'
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Title is required');
    });

    it('should validate minimum title length', async () => {
      const newsData = {
        title: 'A'
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Title must be at least 5 characters long');
    });

    it('should validate maximum title length', async () => {
      const newsData = {
        title: 'A'.repeat(201)
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Title cannot exceed 200 characters');
    });

    it('should validate maximum content length', async () => {
      const newsData = {
        title: 'Valid News Title',
        content: 'A'.repeat(5001)
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Content cannot exceed 5000 characters');
    });

    it('should validate maximum author length', async () => {
      const newsData = {
        title: 'Valid News Title',
        author: 'A'.repeat(51)
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Author name cannot exceed 50 characters');
    });

    it('should validate category enum values', async () => {
      const newsData = {
        title: 'Valid News Title',
        category: 'invalid-category'
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow('Category must be one of: general, health, agriculture, education, events, announcements');
    });

    it('should accept valid category values', async () => {
      const validCategories = ['general', 'health', 'agriculture', 'education', 'events', 'announcements'];
      
      for (const category of validCategories) {
        const newsData = {
          title: `News about ${category}`,
          category: category
        };

        const news = new News(newsData);
        const savedNews = await news.save();
        
        expect(savedNews.category).toBe(category);
      }
    });

    it('should validate publishDate is a valid date', async () => {
      const newsData = {
        title: 'Valid News Title',
        publishDate: 'invalid-date'
      };

      const news = new News(newsData);
      
      await expect(news.save()).rejects.toThrow();
    });

    it('should accept valid publishDate', async () => {
      const customDate = new Date('2024-01-15');
      const newsData = {
        title: 'Valid News Title',
        publishDate: customDate
      };

      const news = new News(newsData);
      const savedNews = await news.save();
      
      expect(savedNews.publishDate.getTime()).toBe(customDate.getTime());
    });
  });

  describe('News Virtual Fields', () => {
    it('should provide formattedDate virtual field', async () => {
      const customDate = new Date('2024-01-15');
      const newsData = {
        title: 'Test News Article',
        publishDate: customDate
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      expect(savedNews.formattedDate).toBe(customDate.toLocaleDateString());
    });

    it('should provide summary virtual field', async () => {
      const newsData = {
        title: 'Test News Article',
        category: 'health',
        author: 'Dr. Smith'
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      const summary = savedNews.summary;
      expect(summary.id).toBeDefined();
      expect(summary.title).toBe(newsData.title);
      expect(summary.category).toBe(newsData.category);
      expect(summary.author).toBe(newsData.author);
      expect(summary.publishDate).toBeDefined();
      expect(summary.isActive).toBe(true);
    });

    it('should provide preview virtual field', async () => {
      const shortContent = 'This is a short content.';
      const longContent = 'A'.repeat(200);

      // Test short content
      const newsData1 = {
        title: 'Test News 1',
        content: shortContent
      };

      const news1 = new News(newsData1);
      const savedNews1 = await news1.save();
      expect(savedNews1.preview).toBe(shortContent);

      // Test long content
      const newsData2 = {
        title: 'Test News 2',
        content: longContent
      };

      const news2 = new News(newsData2);
      const savedNews2 = await news2.save();
      expect(savedNews2.preview).toBe(longContent.substring(0, 150) + '...');

      // Test no content
      const newsData3 = {
        title: 'Test News 3'
      };

      const news3 = new News(newsData3);
      const savedNews3 = await news3.save();
      expect(savedNews3.preview).toBe('');
    });
  });

  describe('News Queries', () => {
    beforeEach(async () => {
      // Create test news articles
      const newsArticles = [
        { 
          title: 'Health Fair Announcement',
          content: 'Community health fair next month.',
          category: 'health',
          author: 'Dr. Smith',
          isActive: true,
          publishDate: new Date('2024-01-15')
        },
        { 
          title: 'Agricultural Workshop',
          content: 'Learn new farming techniques.',
          category: 'agriculture',
          author: 'Farmer Joe',
          isActive: true,
          publishDate: new Date('2024-01-10')
        },
        { 
          title: 'Old Announcement',
          content: 'This is an inactive announcement.',
          category: 'announcements',
          isActive: false,
          publishDate: new Date('2024-01-05')
        }
      ];

      await News.insertMany(newsArticles);
    });

    it('should find active news articles', async () => {
      const activeNews = await News.find({ isActive: true });
      expect(activeNews).toHaveLength(2);
    });

    it('should find news by category', async () => {
      const healthNews = await News.find({ category: 'health' });
      expect(healthNews).toHaveLength(1);
      expect(healthNews[0].title).toBe('Health Fair Announcement');
    });

    it('should find news sorted by publish date', async () => {
      const sortedNews = await News.find({ isActive: true }).sort({ publishDate: -1 });
      expect(sortedNews).toHaveLength(2);
      // Most recent first
      expect(sortedNews[0].title).toBe('Health Fair Announcement');
      expect(sortedNews[1].title).toBe('Agricultural Workshop');
    });

    it('should find news by author', async () => {
      const drSmithNews = await News.find({ author: 'Dr. Smith' });
      expect(drSmithNews).toHaveLength(1);
      expect(drSmithNews[0].category).toBe('health');
    });
  });

  describe('News Updates', () => {
    it('should update news article', async () => {
      const newsData = {
        title: 'Original Title',
        content: 'Original content'
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      savedNews.title = 'Updated Title';
      savedNews.content = 'Updated content';
      const updatedNews = await savedNews.save();

      expect(updatedNews.title).toBe('Updated Title');
      expect(updatedNews.content).toBe('Updated content');
      expect(updatedNews.updatedAt).not.toEqual(updatedNews.createdAt);
    });

    it('should deactivate news article', async () => {
      const newsData = {
        title: 'Test News Article'
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      expect(savedNews.isActive).toBe(true);

      savedNews.isActive = false;
      const updatedNews = await savedNews.save();

      expect(updatedNews.isActive).toBe(false);
    });
  });
});