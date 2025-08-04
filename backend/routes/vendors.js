const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all vendors with filtering and pagination
// @route   GET /api/vendors
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      status: 'approved',
      isActive: true
    };

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Business type filter
    if (req.query.businessType) {
      filter.businessType = req.query.businessType;
    }

    // Rating filter
    if (req.query.minRating) {
      filter['rating.average'] = { $gte: parseFloat(req.query.minRating) };
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'sales':
        sort = { totalSales: -1 };
        break;
      case 'newest':
        sort = { approvedAt: -1 };
        break;
      case 'name':
        sort = { businessName: 1 };
        break;
      default:
        sort = { 'rating.average': -1 };
    }

    // Execute query
    const vendors = await Vendor.find(filter)
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-bankDetails -documents');

    // Get total count for pagination
    const total = await Vendor.countDocuments(filter);

    res.json({
      success: true,
      count: vendors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      vendors
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendors'
    });
  }
});

// @desc    Get single vendor with products
// @route   GET /api/vendors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .select('-bankDetails -documents');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.status !== 'approved' || !vendor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not available'
      });
    }

    // Get vendor's products
    const products = await Product.find({
      vendor: vendor._id,
      isActive: true,
      status: 'active'
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      vendor: {
        ...vendor.toObject(),
        products
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor'
    });
  }
});

// @desc    Apply to become a vendor
// @route   POST /api/vendors/apply
// @access  Private (Customer only)
router.post('/apply', protect, authorize('customer'), [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('businessDescription').trim().notEmpty().withMessage('Business description is required'),
  body('businessType').isIn(['individual', 'company', 'partnership']).withMessage('Invalid business type'),
  body('businessAddress.street').trim().notEmpty().withMessage('Business street address is required'),
  body('businessAddress.city').trim().notEmpty().withMessage('Business city is required'),
  body('businessAddress.state').trim().notEmpty().withMessage('Business state is required'),
  body('businessAddress.zipCode').trim().notEmpty().withMessage('Business zip code is required'),
  body('contactInfo.phone').trim().notEmpty().withMessage('Contact phone is required'),
  body('contactInfo.email').isEmail().withMessage('Valid contact email is required'),
  body('bankDetails.accountHolderName').trim().notEmpty().withMessage('Account holder name is required'),
  body('bankDetails.accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('bankDetails.routingNumber').trim().notEmpty().withMessage('Routing number is required'),
  body('bankDetails.bankName').trim().notEmpty().withMessage('Bank name is required')
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

    // Check if user already has a vendor application
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor application already exists',
        status: existingVendor.status
      });
    }

    // Create vendor application
    const vendor = await Vendor.create({
      ...req.body,
      user: req.user.id,
      status: 'pending'
    });

    // Update user role to vendor
    req.user.role = 'vendor';
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully',
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        status: vendor.status,
        createdAt: vendor.createdAt
      }
    });
  } catch (error) {
    console.error('Vendor application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting vendor application'
    });
  }
});

// @desc    Get current vendor profile
// @route   GET /api/vendors/profile/me
// @access  Private (Vendor only)
router.get('/profile/me', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor profile'
    });
  }
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile/me
// @access  Private (Vendor only)
router.put('/profile/me', protect, authorize('vendor'), [
  body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('businessDescription').optional().trim().notEmpty().withMessage('Business description cannot be empty'),
  body('contactInfo.phone').optional().trim().notEmpty().withMessage('Contact phone cannot be empty'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid contact email is required')
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

    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vendor profile'
    });
  }
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard/stats
// @access  Private (Vendor only)
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Get date range for filtering (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get order statistics
    const orderStats = await Order.getOrderStats(vendor._id, {
      start: startDate,
      end: endDate
    });

    // Get recent orders
    const recentOrders = await Order.find({ vendor: vendor._id })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status pricing.total createdAt');

    // Get low stock products
    const lowStockProducts = await Product.find({
      vendor: vendor._id,
      'inventory.quantity': { $lte: '$inventory.lowStockThreshold' },
      isActive: true
    })
    .select('name inventory sku')
    .limit(10);

    // Get top selling products
    const topProducts = await Product.find({
      vendor: vendor._id,
      isActive: true
    })
    .sort({ 'sales.totalSold': -1 })
    .limit(5)
    .select('name sales.totalSold sales.totalRevenue images');

    // Get product counts
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });
    const activeProducts = await Product.countDocuments({ vendor: vendor._id, status: 'active' });
    const pendingProducts = await Product.countDocuments({ vendor: vendor._id, status: 'pending' });
    
    // Get monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyOrders = await Order.find({
      vendor: vendor._id,
      createdAt: { $gte: currentMonth },
      status: { $in: ['completed', 'delivered'] }
    });
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    
    // Get top product
    const topProduct = await Product.findOne({
      vendor: vendor._id,
      isActive: true
    })
    .sort({ 'sales.totalSold': -1 })
    .select('name sales.totalSold');

    res.json({
      success: true,
      stats: {
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        pendingProducts: pendingProducts || 0,
        totalOrders: vendor.totalOrders || 0,
        totalRevenue: vendor.totalRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0,
        rating: vendor.rating || 0,
        status: vendor.status,
        topProduct: topProduct || null,
        recentOrders,
        lowStockProducts,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor statistics'
    });
  }
});

// @desc    Get vendor's products
// @route   GET /api/vendors/products/me
// @access  Private (Vendor only)
router.get('/products/me', protect, authorize('vendor'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { vendor: vendor._id };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Get products
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    // Calculate stats
    const stats = {
      total: await Product.countDocuments({ vendor: vendor._id }),
      active: await Product.countDocuments({ vendor: vendor._id, status: 'active' }),
      pending: await Product.countDocuments({ vendor: vendor._id, status: 'pending' }),
      suspended: await Product.countDocuments({ vendor: vendor._id, status: 'suspended' }),
      totalRevenue: 0 // This would be calculated from orders
    };

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products,
      stats
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor products'
    });
  }
});

// @desc    Create new product
// @route   POST /api/vendors/products
// @access  Private (Vendor only)
router.post('/products', protect, authorize('vendor'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
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
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Create product data
    const productData = {
      ...req.body,
      vendor: vendor._id,
      status: req.body.status || 'pending' // Default to pending for approval
    };

    // Create product
    const product = await Product.create(productData);
    
    // Populate the product
    await product.populate('category', 'name slug');
    await product.populate('vendor', 'businessName');

    // Update vendor stats
    await vendor.updateStats();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
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
// @route   PUT /api/vendors/products/:id
// @access  Private (Vendor only - own products)
router.put('/products/:id', protect, authorize('vendor'), [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required')
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
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Find and update product
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug').populate('vendor', 'businessName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

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
// @route   DELETE /api/vendors/products/:id
// @access  Private (Vendor only - own products)
router.delete('/products/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if product has active orders
    const activeOrders = await Order.countDocuments({
      'items.product': req.params.id,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with active orders'
      });
    }

    // Find and delete product
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: vendor._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Update vendor stats
    await vendor.updateStats();

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

// @desc    Get single product for editing
// @route   GET /api/vendors/products/:id
// @access  Private (Vendor only - own products)
router.get('/products/:id', protect, authorize('vendor'), async (req, res) => {
  try {
    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Find product
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: vendor._id
    }).populate('category', 'name slug').populate('vendor', 'businessName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
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

// @desc    Bulk update product status
// @route   PUT /api/vendors/products/bulk/status
// @access  Private (Vendor only)
router.put('/products/bulk/status', protect, authorize('vendor'), [
  body('productIds').isArray().withMessage('Product IDs must be an array'),
  body('status').isIn(['active', 'inactive', 'draft']).withMessage('Invalid status')
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
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { productIds, status } = req.body;

    // Update products
    const result = await Product.updateMany(
      {
        _id: { $in: productIds },
        vendor: vendor._id
      },
      { status },
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating products'
    });
  }
});

module.exports = router;
