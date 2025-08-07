const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  publishDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Publish date must be a valid date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    enum: {
      values: ['general', 'health', 'agriculture', 'education', 'events', 'announcements'],
      message: 'Category must be one of: general, health, agriculture, education, events, announcements'
    },
    default: 'general'
  },
  author: {
    type: String,
    trim: true,
    maxlength: [50, 'Author name cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
newsSchema.index({ isActive: 1, publishDate: -1 });
newsSchema.index({ category: 1, isActive: 1 });
newsSchema.index({ title: 'text', content: 'text' });

// Virtual for formatted publish date
newsSchema.virtual('formattedDate').get(function() {
  return this.publishDate.toLocaleDateString();
});

// Virtual for news summary
newsSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    author: this.author,
    publishDate: this.publishDate,
    isActive: this.isActive
  };
});

// Virtual for content preview (first 150 characters)
newsSchema.virtual('preview').get(function() {
  if (!this.content) return '';
  return this.content.length > 150 
    ? this.content.substring(0, 150) + '...' 
    : this.content;
});

// Ensure virtual fields are serialized
newsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('News', newsSchema);