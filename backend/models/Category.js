const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  icon: {
    type: String, // Font awesome icon class or similar
    default: 'fas fa-tag'
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3 // Maximum 3 levels deep
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
      default: 'text'
    },
    options: [String], // For select and multiselect types
    required: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug and set level
categorySchema.pre('save', async function(next) {
  // Generate slug from name if not provided
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set level based on parent
  if (this.parent) {
    const parent = await mongoose.model('Category').findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
      
      // Add this category to parent's children if not already there
      if (!parent.children.includes(this._id)) {
        parent.children.push(this._id);
        await parent.save();
      }
    }
  } else {
    this.level = 0;
  }
  
  next();
});

// Method to get category hierarchy (breadcrumb)
categorySchema.methods.getHierarchy = async function() {
  const hierarchy = [this];
  let current = this;
  
  while (current.parent) {
    current = await mongoose.model('Category').findById(current.parent);
    if (current) {
      hierarchy.unshift(current);
    } else {
      break;
    }
  }
  
  return hierarchy;
};

// Method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  const queue = [...this.children];
  
  while (queue.length > 0) {
    const childId = queue.shift();
    const child = await mongoose.model('Category').findById(childId).populate('children');
    
    if (child) {
      descendants.push(child);
      queue.push(...child.children);
    }
  }
  
  return descendants;
};

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  
  // Get all descendants to count products in subcategories too
  const descendants = await this.getDescendants();
  const categoryIds = [this._id, ...descendants.map(d => d._id)];
  
  this.productCount = await Product.countDocuments({
    category: { $in: categoryIds },
    isActive: true,
    status: 'active'
  });
  
  await this.save();
};

// Static method to build category tree
categorySchema.statics.buildTree = async function(parentId = null) {
  const categories = await this.find({ 
    parent: parentId,
    isActive: true 
  }).sort({ sortOrder: 1, name: 1 });
  
  const tree = [];
  
  for (const category of categories) {
    const categoryObj = category.toObject();
    categoryObj.children = await this.buildTree(category._id);
    tree.push(categoryObj);
  }
  
  return tree;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    isActive: true 
  })
  .sort({ sortOrder: 1, name: 1 })
  .limit(limit);
};

module.exports = mongoose.model('Category', categorySchema);
