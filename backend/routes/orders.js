const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { protect, authorize, vendorOwnership } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('payment.method').isIn(['stripe', 'paypal', 'cod']).withMessage('Invalid payment method')
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

    const { items, shippingAddress, billingAddress, payment } = req.body;

    // Group items by vendor
    const vendorOrders = {};
    
    for (const item of items) {
      const product = await Product.findById(item.product).populate('vendor');
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      if (!product.isAvailable(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available in requested quantity`
        });
      }

      const vendorId = product.vendor._id.toString();
      
      if (!vendorOrders[vendorId]) {
        vendorOrders[vendorId] = {
          vendor: product.vendor,
          items: [],
          subtotal: 0
        };
      }

      const itemSubtotal = product.currentPrice * item.quantity;
      
      vendorOrders[vendorId].items.push({
        product: product._id,
        name: product.name,
        image: product.primaryImage,
        price: product.currentPrice,
        quantity: item.quantity,
        variant: item.variant,
        sku: product.sku,
        subtotal: itemSubtotal
      });

      vendorOrders[vendorId].subtotal += itemSubtotal;
    }

    // Create separate orders for each vendor
    const createdOrders = [];

    for (const [vendorId, orderData] of Object.entries(vendorOrders)) {
      const tax = orderData.subtotal * 0.08; // 8% tax
      const shipping = orderData.subtotal >= 50 ? 0 : 5.99;
      const total = orderData.subtotal + tax + shipping;

      const order = await Order.create({
        customer: req.user.id,
        vendor: vendorId,
        items: orderData.items,
        pricing: {
          subtotal: orderData.subtotal,
          tax,
          shipping,
          total
        },
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        payment: {
          ...payment,
          amount: total
        }
      });

      // Update product inventory
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { 'inventory.quantity': -item.quantity } }
        );
      }

      createdOrders.push(order);
    }

    res.status(201).json({
      success: true,
      message: 'Orders created successfully',
      orders: createdOrders
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
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
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('vendor', 'businessName contactInfo')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is the vendor or is admin
    if (
      order.customer._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      // Check if user is the vendor for this order
      if (req.user.role === 'vendor') {
        const vendor = await Vendor.findOne({ user: req.user.id });
        if (!vendor || order.vendor._id.toString() !== vendor._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this order'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// @desc    Update order status (Vendor/Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor/Admin)
router.put('/:id/status', protect, authorize('vendor', 'admin'), [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('message').optional().trim().notEmpty().withMessage('Message cannot be empty')
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if vendor owns this order (unless admin)
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor || order.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this order'
        });
      }
    }

    const { status, message, trackingNumber, carrier } = req.body;

    // Update order status
    await order.updateStatus(status, message, req.user.id);

    // Update tracking info if provided
    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.tracking.carrier = carrier;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().trim().notEmpty().withMessage('Cancellation reason cannot be empty')
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.cancellation.reason = req.body.reason || 'Cancelled by customer';
    await order.updateStatus('cancelled', 'Order cancelled', req.user.id);

    // Restore product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

module.exports = router;
