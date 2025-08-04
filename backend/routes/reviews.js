const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      product: req.params.productId,
      isApproved: true,
      isHidden: false
    };

    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }

    const reviews = await Review.find(filter)
      .populate('customer', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    // Get review statistics
    const stats = await Review.getReviewStats(req.params.productId);

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      reviews,
      stats: stats[0] || { totalReviews: 0, averageRating: 0, ratingDistribution: [] }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews'
    });
  }
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters')
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

    const { product, order, rating, comment, title } = req.body;

    // Verify the order exists and belongs to the user
    const orderDoc = await Order.findOne({
      _id: order,
      customer: req.user.id,
      status: 'delivered'
    });

    if (!orderDoc) {
      return res.status(400).json({
        success: false,
        message: 'Order not found or not eligible for review'
      });
    }

    // Verify the product is in the order
    const orderItem = orderDoc.items.find(item => item.product.toString() === product);
    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check if review already exists for this order-product combination
    const existingReview = await Review.findOne({ order, product });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this product in this order'
      });
    }

    // Get product and vendor info
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create review
    const review = await Review.create({
      product,
      vendor: productDoc.vendor,
      customer: req.user.id,
      order,
      rating,
      comment,
      title,
      isVerifiedPurchase: true
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review'
    });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().notEmpty().withMessage('Review comment cannot be empty'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters')
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

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review'
    });
  }
});

// @desc    Vote on a review (helpful/unhelpful)
// @route   POST /api/reviews/:id/vote
// @access  Private
router.post('/:id/vote', protect, [
  body('vote').isIn(['helpful', 'unhelpful']).withMessage('Vote must be helpful or unhelpful')
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

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Can't vote on own review
    if (review.customer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own review'
      });
    }

    await review.vote(req.user.id, req.body.vote);

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes
    });
  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording vote'
    });
  }
});

// @desc    Flag a review
// @route   POST /api/reviews/:id/flag
// @access  Private
router.post('/:id/flag', protect, [
  body('reason').isIn(['spam', 'inappropriate', 'fake', 'offensive']).withMessage('Invalid flag reason')
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

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.flag(req.body.reason, req.user.id);

    res.json({
      success: true,
      message: 'Review flagged successfully'
    });
  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error flagging review'
    });
  }
});

module.exports = router;
