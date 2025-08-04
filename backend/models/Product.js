const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  price: {
    original: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price cannot be negative']
    },
    discounted: {
      type: Number,
      min: [0, 'Discounted price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Inventory quantity is required'],
      min: [0, 'Inventory cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  dimensions: {
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb', 'g', 'oz'],
        default: 'kg'
      }
    },
    length: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm', 'ft'],
        default: 'cm'
      }
    },
    width: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm', 'ft'],
        default: 'cm'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm', 'ft'],
        default: 'cm'
      }
    }
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true // e.g., "Color", "Size"
    },
    options: [{
      value: {
        type: String,
        required: true // e.g., "Red", "Large"
      },
      price: {
        type: Number,
        default: 0 // Additional price for this variant
      },
      sku: {
        type: String,
        required: true
      },
      inventory: {
        type: Number,
        default: 0
      },
      image: {
        public_id: String,
        url: String
      }
    }]
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    }
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
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  sales: {
    totalSold: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    lastSaleDate: Date
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'heavy', 'fragile', 'digital'],
      default: 'standard'
    },
    freeShipping: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'price.original': 1 });
productSchema.index({ 'price.discounted': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'sales.totalSold': -1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'seo.slug': 1 });

// Virtual for current price (discounted if available, otherwise original)
productSchema.virtual('currentPrice').get(function() {
  return this.price.discounted && this.price.discounted > 0 ? this.price.discounted : this.price.original;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.price.discounted && this.price.discounted > 0) {
    return Math.round(((this.price.original - this.price.discounted) / this.price.original) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'in_stock';
  if (this.inventory.quantity === 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isPrimary = index === 0;
      });
    } else if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  this.lastModified = Date.now();
  next();
});

// Method to update rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
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

// Method to update inventory
productSchema.methods.updateInventory = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else if (operation === 'add') {
    this.inventory.quantity += quantity;
  }
  
  // Update status based on inventory
  if (this.inventory.quantity === 0 && this.inventory.trackQuantity) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.inventory.quantity > 0) {
    this.status = 'active';
  }
  
  return this.save();
};

// Method to check if product is available
productSchema.methods.isAvailable = function(requestedQuantity = 1) {
  if (!this.isActive || this.status !== 'active') return false;
  if (!this.inventory.trackQuantity) return true;
  if (this.inventory.allowBackorder) return true;
  return this.inventory.quantity >= requestedQuantity;
};

module.exports = mongoose.model('Product', productSchema);
