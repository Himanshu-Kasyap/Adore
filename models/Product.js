const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v >= 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)|(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*$)/.test(v);
      },
      message: 'Image must be a valid URL or file path'
    }
  },
  category: {
    type: String,
    trim: true,
    enum: {
      values: ['food', 'clothing', 'tools', 'electronics', 'books', 'health', 'other'],
      message: 'Category must be one of: food, clothing, tools, electronics, books, health, other'
    }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  inventory: {
    type: Number,
    default: 0,
    min: [0, 'Inventory cannot be negative']
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  return this.inStock && this.inventory > 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);