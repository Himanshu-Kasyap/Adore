const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [2, 'Service name must be at least 2 characters long'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)|(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*$)/.test(v);
      },
      message: 'Icon must be a valid URL or file path'
    }
  },
  category: {
    type: String,
    trim: true,
    enum: {
      values: ['healthcare', 'education', 'agriculture', 'transportation', 'utilities', 'other'],
      message: 'Category must be one of: healthcare, education, agriculture, transportation, utilities, other'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Virtual for service summary
serviceSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    isActive: this.isActive
  };
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);