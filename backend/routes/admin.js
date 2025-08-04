const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get pending vendor applications
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'firstName lastName')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get revenue stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totals: {
          users: totalUsers,
          vendors: totalVendors,
          products: totalProducts,
          orders: totalOrders,
          pendingVendors
        },
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin statistics'
    });
  }
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @desc    Get pending vendor applications
// @route   GET /api/admin/vendors/pending
// @access  Private (Admin only)
router.get('/vendors/pending', async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ status: 'pending' })
      .populate('user', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingVendors.length,
      vendors: pendingVendors
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending vendors'
    });
  }
});

// @desc    Approve/Reject vendor application
// @route   PUT /api/admin/vendors/:id/status
// @access  Private (Admin only)
router.put('/vendors/:id/status', [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('rejectionReason').optional().trim().notEmpty().withMessage('Rejection reason cannot be empty')
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

    const { status, rejectionReason } = req.body;

    const vendor = await Vendor.findById(req.params.id).populate('user');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.status = status;
    vendor.approvedBy = req.user.id;

    if (status === 'approved') {
      vendor.approvedAt = new Date();
    } else if (status === 'rejected') {
      vendor.rejectionReason = rejectionReason;
    }

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor application ${status} successfully`,
      vendor
    });
  } catch (error) {
    console.error('Update vendor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vendor status'
    });
  }
});

// @desc    Get all products with filters
// @route   GET /api/admin/products
// @access  Private (Admin only)
router.get('/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const products = await Product.find(filter)
      .populate('vendor', 'businessName')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private (Admin only)
router.put('/products/:id/status', [
  body('status').isIn(['draft', 'active', 'inactive', 'discontinued']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('vendor', 'businessName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product status updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product status'
    });
  }
});

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Private (Admin only)
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName email')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// ===== USER MANAGEMENT FEATURES =====

// @desc    Get individual user profile with order history
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist', 'name images price');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order history
    const orders = await Order.find({ customer: req.params.id })
      .populate('vendor', 'businessName')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get user statistics
    const totalOrders = await Order.countDocuments({ customer: req.params.id });
    const totalSpent = await Order.aggregate([
      { $match: { customer: user._id, status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    res.json({
      success: true,
      user,
      orders,
      statistics: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        joinedDate: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// @desc    Disable/Enable user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from disabling themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account status'
      });
    }

    user.isActive = isActive;
    if (reason) {
      user.statusChangeReason = reason;
      user.statusChangedBy = req.user.id;
      user.statusChangedAt = new Date();
    }

    await user.save();

    res.json({
      success: true,
      message: `User account ${isActive ? 'enabled' : 'disabled'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has active orders
    const activeOrders = await Order.countDocuments({
      customer: req.params.id,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active orders'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// ===== VENDOR MANAGEMENT FEATURES =====

// @desc    Get all vendors with filters
// @route   GET /api/admin/vendors
// @access  Private (Admin only)
router.get('/vendors', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.search) {
      filter.$or = [
        { businessName: { $regex: req.query.search, $options: 'i' } },
        { businessEmail: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter)
      .populate('user', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// @desc    Get individual vendor profile with detailed info
// @route   GET /api/admin/vendors/:id
// @access  Private (Admin only)
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'firstName lastName email phone createdAt lastLogin');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor's products
    const products = await Product.find({ vendor: req.params.id })
      .select('name images price stock status ratings createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get vendor's orders and earnings
    const orders = await Order.find({ vendor: req.params.id })
      .populate('customer', 'firstName lastName')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate earnings
    const earningsStats = await Order.aggregate([
      { $match: { vendor: vendor._id, status: { $in: ['delivered', 'shipped'] } } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$pricing.vendorAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    const stats = earningsStats[0] || {
      totalEarnings: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };

    res.json({
      success: true,
      vendor,
      products,
      orders,
      statistics: {
        ...stats,
        totalProducts: await Product.countDocuments({ vendor: req.params.id }),
        activeProducts: await Product.countDocuments({ vendor: req.params.id, status: 'active' }),
        averageRating: vendor.ratings.average
      }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor profile'
    });
  }
});

// @desc    Suspend/Unsuspend vendor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Private (Admin only)
router.put('/vendors/:id/suspend', [
  body('suspended').isBoolean().withMessage('suspended must be a boolean'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { suspended, reason } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.suspended = suspended;
    if (reason) {
      vendor.suspensionReason = reason;
      vendor.suspendedBy = req.user.id;
      vendor.suspendedAt = suspended ? new Date() : null;
    }

    await vendor.save();

    // Update all vendor's products status
    if (suspended) {
      await Product.updateMany(
        { vendor: req.params.id },
        { status: 'suspended' }
      );
    }

    res.json({
      success: true,
      message: `Vendor ${suspended ? 'suspended' : 'unsuspended'} successfully`,
      vendor
    });
  } catch (error) {
    console.error('Suspend vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vendor suspension status'
    });
  }
});

// @desc    Reset vendor password
// @route   PUT /api/admin/vendors/:id/reset-password
// @access  Private (Admin only)
router.put('/vendors/:id/reset-password', [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { newPassword } = req.body;
    const vendor = await Vendor.findById(req.params.id).populate('user');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findByIdAndUpdate(vendor.user._id, {
      password: hashedPassword,
      passwordResetBy: req.user.id,
      passwordResetAt: new Date()
    });

    res.json({
      success: true,
      message: 'Vendor password reset successfully'
    });
  } catch (error) {
    console.error('Reset vendor password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting vendor password'
    });
  }
});

// @desc    Send message/notification to vendor
// @route   POST /api/admin/vendors/:id/message
// @access  Private (Admin only)
router.post('/vendors/:id/message', [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['info', 'warning', 'urgent']).withMessage('Type must be info, warning, or urgent')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, message, type = 'info' } = req.body;
    const vendor = await Vendor.findById(req.params.id).populate('user');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Add message to vendor's messages array
    vendor.messages = vendor.messages || [];
    vendor.messages.push({
      from: req.user.id,
      subject,
      message,
      type,
      sentAt: new Date(),
      read: false
    });

    await vendor.save();

    // TODO: Send email notification to vendor
    // This would integrate with your email service (nodemailer, etc.)

    res.json({
      success: true,
      message: 'Message sent to vendor successfully'
    });
  } catch (error) {
    console.error('Send vendor message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message to vendor'
    });
  }
});

// ===== PRODUCT MANAGEMENT ROUTES =====

// @desc    Get all products with admin filters
// @route   GET /api/admin/products
// @access  Private (Admin only)
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      vendor,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by vendor
    if (vendor) {
      query.vendor = vendor;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('vendor', 'businessName email')
      .populate('category', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private (Admin only)
router.put('/products/:id/status', [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { status, reason } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product status
    product.status = status;
    product.statusHistory = product.statusHistory || [];
    product.statusHistory.push({
      status,
      reason,
      changedBy: req.user.id,
      changedAt: new Date()
    });

    await product.save();

    res.json({
      success: true,
      message: `Product ${status} successfully`,
      product: {
        _id: product._id,
        name: product.name,
        status: product.status
      }
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product status'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has active orders
    const activeOrders = await Order.countDocuments({
      'items.product': req.params.id,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with active orders'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

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

// @desc    Submit product report
// @route   POST /api/admin/products/:id/report
// @access  Private (Admin only)
router.post('/products/:id/report', [
  body('reportType').isIn(['quality', 'inappropriate', 'copyright', 'fake', 'pricing', 'other']).withMessage('Invalid report type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { reportType, description, severity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create product report
    const report = {
      product: req.params.id,
      reportType,
      description,
      severity,
      reportedBy: req.user.id,
      reportedAt: new Date(),
      status: 'pending'
    };

    // Add report to product
    product.reports = product.reports || [];
    product.reports.push(report);

    // If severity is high or critical, suspend the product
    if (severity === 'high' || severity === 'critical') {
      product.status = 'suspended';
      product.statusHistory = product.statusHistory || [];
      product.statusHistory.push({
        status: 'suspended',
        reason: `Auto-suspended due to ${severity} severity report: ${reportType}`,
        changedBy: req.user.id,
        changedAt: new Date()
      });
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Submit product report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting product report'
    });
  }
});

// @desc    Get product reports
// @route   GET /api/admin/products/reports
// @access  Private (Admin only)
router.get('/products/reports', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'pending',
      severity,
      reportType
    } = req.query;

    const query = { 'reports.0': { $exists: true } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate('vendor', 'businessName email')
      .populate('reports.reportedBy', 'name email')
      .sort({ 'reports.reportedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter and format reports
    const reports = [];
    products.forEach(product => {
      product.reports.forEach(report => {
        if (status && report.status !== status) return;
        if (severity && report.severity !== severity) return;
        if (reportType && report.reportType !== reportType) return;

        reports.push({
          ...report.toObject(),
          product: {
            _id: product._id,
            name: product.name,
            vendor: product.vendor
          }
        });
      });
    });

    const totalReports = reports.length;
    const totalPages = Math.ceil(totalReports / parseInt(limit));

    res.json({
      success: true,
      reports: reports.slice(0, parseInt(limit)),
      totalReports,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get product reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product reports'
    });
  }
});

// @desc    Get product analytics
// @route   GET /api/admin/products/analytics
// @access  Private (Admin only)
router.get('/products/analytics', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const suspendedProducts = await Product.countDocuments({ status: 'suspended' });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });

    // Top selling products
    const topSellingProducts = await Product.find()
      .populate('vendor', 'businessName')
      .sort({ 'sales.totalSold': -1 })
      .limit(10)
      .select('name sales vendor images');

    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$sales.totalRevenue' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent product reports
    const recentReports = await Product.find({ 'reports.0': { $exists: true } })
      .populate('vendor', 'businessName')
      .populate('reports.reportedBy', 'name')
      .sort({ 'reports.reportedAt': -1 })
      .limit(5)
      .select('name vendor reports');

    res.json({
      success: true,
      analytics: {
        totalProducts,
        activeProducts,
        suspendedProducts,
        outOfStockProducts,
        lowStockProducts,
        topSellingProducts,
        productsByCategory,
        recentReports
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product analytics'
    });
  }
});

// ========================================
// CUSTOMER MANAGEMENT ROUTES
// ========================================

// @desc    Get all customers with filters and pagination
// @route   GET /api/admin/customers
// @access  Private/Admin
router.get('/customers', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      dateFilter = 'all'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { role: 'customer' };

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Get customers with pagination
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCustomers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limitNum);

    // Get stats
    const stats = {
      total: await User.countDocuments({ role: 'customer' }),
      active: await User.countDocuments({ role: 'customer', isActive: true }),
      inactive: await User.countDocuments({ role: 'customer', isActive: false }),
      newThisMonth: await User.countDocuments({
        role: 'customer',
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    };

    res.json({
      success: true,
      customers,
      currentPage: pageNum,
      totalPages,
      totalCustomers,
      stats
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customers'
    });
  }
});

// @desc    Get customer orders
// @route   GET /api/admin/customers/:id/orders
// @access  Private/Admin
router.get('/customers/:id/orders', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer orders
    const orders = await Order.find({ customer: customerId })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customer orders'
    });
  }
});

// @desc    Update customer status (enable/disable)
// @route   PUT /api/admin/customers/:id/status
// @access  Private/Admin
router.put('/customers/:id/status', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { isActive } = req.body;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Can only modify customer accounts'
      });
    }

    // Update customer status
    customer.isActive = isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer account ${isActive ? 'enabled' : 'disabled'} successfully`,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        isActive: customer.isActive
      }
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating customer status'
    });
  }
});

// @desc    Delete customer account
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
router.delete('/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete customer accounts'
      });
    }

    // Check for active orders
    const activeOrders = await Order.countDocuments({
      customer: customerId,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${activeOrders} active orders. Please complete or cancel orders first.`
      });
    }

    // Delete customer
    await User.findByIdAndDelete(customerId);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting customer'
    });
  }
});

module.exports = router;
