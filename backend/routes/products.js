const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { protect, authorize, optionalAuth, vendorOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], optionalAuth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      isActive: true,
      status: 'active'
    };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Vendor filter
    if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.$or = [
        {
          'price.discounted': {
            ...(req.query.minPrice && { $gte: parseFloat(req.query.minPrice) }),
            ...(req.query.maxPrice && { $lte: parseFloat(req.query.maxPrice) })
          }
        },
        {
          'price.discounted': { $exists: false },
          'price.original': {
            ...(req.query.minPrice && { $gte: parseFloat(req.query.minPrice) }),
            ...(req.query.maxPrice && { $lte: parseFloat(req.query.maxPrice) })
          }
        }
      ];
    }

    // Rating filter
    if (req.query.rating) {
      filter['rating.average'] = { $gte: parseFloat(req.query.rating) };
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }

    // Tags filter
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filter.tags = { $in: tags };
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'price_low':
        sort = { 'price.original': 1 };
        break;
      case 'price_high':
        sort = { 'price.original': -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { 'sales.totalSold': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('vendor', 'businessName rating')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'businessName rating contactInfo businessAddress')
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        populate: {
          path: 'customer',
          select: 'firstName lastName avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is accessible
    if (!product.isActive || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor only)
router.post('/', protect, authorize('vendor'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('price.original').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('inventory.quantity').isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer'),
  body('sku').trim().notEmpty().withMessage('SKU is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    if (vendor.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Vendor account must be approved to create products'
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Create product
    const product = await Product.create({
      ...req.body,
      vendor: vendor._id,
      sku: req.body.sku.toUpperCase()
    });

    // Update vendor product count
    await vendor.updateStats();

    const populatedProduct = await Product.findById(product._id)
      .populate('vendor', 'businessName')
      .populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor owner or Admin)
router.put('/:id', protect, vendorOwnership(Product), [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('price.original').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('inventory.quantity').optional().isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('vendor', 'businessName')
    .populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor owner or Admin)
router.delete('/:id', protect, vendorOwnership(Product), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    // Update vendor stats
    if (req.vendor) {
      await req.vendor.updateStats();
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      isActive: true,
      status: 'active',
      isFeatured: true
    })
    .populate('vendor', 'businessName rating')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products'
    });
  }
});

module.exports = router;
