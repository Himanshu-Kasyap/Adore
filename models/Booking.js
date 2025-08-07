const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'User ID must be a valid ObjectId'
    }
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Product ID must be a valid ObjectId'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number'
      }
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
    }
  }],
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v >= 0;
      },
      message: 'Total amount must be a valid positive number'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, completed, cancelled'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

// Validate that products array is not empty
bookingSchema.path('products').validate(function(products) {
  return products && products.length > 0;
}, 'Booking must contain at least one product');

// Index for faster queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for total items count
bookingSchema.virtual('totalItems').get(function() {
  return this.products.reduce((total, product) => total + product.quantity, 0);
});

// Virtual for booking summary
bookingSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    totalAmount: this.totalAmount,
    totalItems: this.totalItems,
    status: this.status,
    createdAt: this.createdAt
  };
});

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', function(next) {
  if (this.products && this.products.length > 0) {
    this.totalAmount = this.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }
  next();
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);