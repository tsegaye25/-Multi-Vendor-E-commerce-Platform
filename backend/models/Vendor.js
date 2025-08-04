const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessDescription: {
    type: String,
    required: [true, 'Business description is required'],
    maxlength: [1000, 'Business description cannot exceed 1000 characters']
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'partnership'],
    required: true
  },
  businessLicense: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  logo: {
    public_id: String,
    url: String
  },
  banner: {
    public_id: String,
    url: String
  },
  businessAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    routingNumber: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  commissionRate: {
    type: Number,
    default: 10, // 10% commission
    min: 0,
    max: 100
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  shippingPolicies: {
    domesticShipping: {
      enabled: {
        type: Boolean,
        default: true
      },
      cost: {
        type: Number,
        default: 0
      },
      freeShippingThreshold: {
        type: Number,
        default: 0
      },
      processingTime: {
        type: String,
        default: '1-2 business days'
      }
    },
    internationalShipping: {
      enabled: {
        type: Boolean,
        default: false
      },
      cost: {
        type: Number,
        default: 0
      },
      processingTime: {
        type: String,
        default: '3-5 business days'
      }
    }
  },
  returnPolicy: {
    enabled: {
      type: Boolean,
      default: true
    },
    period: {
      type: Number,
      default: 30 // days
    },
    description: {
      type: String,
      default: 'Items can be returned within 30 days of purchase'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  documents: [{
    type: {
      type: String,
      enum: ['license', 'tax_document', 'identity', 'other'],
      required: true
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
vendorSchema.index({ user: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ businessName: 'text', businessDescription: 'text' });
vendorSchema.index({ 'rating.average': -1 });
vendorSchema.index({ totalSales: -1 });

// Virtual for calculating commission amount
vendorSchema.virtual('commissionAmount').get(function() {
  return (this.totalRevenue * this.commissionRate) / 100;
});

// Method to update vendor stats
vendorSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  const Order = mongoose.model('Order');
  
  // Update total products
  this.totalProducts = await Product.countDocuments({ vendor: this._id, isActive: true });
  
  // Update total orders and revenue
  const orderStats = await Order.aggregate([
    { $match: { vendor: this._id, status: 'delivered' } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  if (orderStats.length > 0) {
    this.totalOrders = orderStats[0].totalOrders;
    this.totalRevenue = orderStats[0].totalRevenue;
  }
  
  await this.save();
};

// Method to calculate average rating
vendorSchema.methods.calculateAverageRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { vendor: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
