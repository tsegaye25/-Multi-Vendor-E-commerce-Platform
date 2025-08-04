const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// @desc    Test email service
// @route   POST /api/email/test
// @access  Private (Admin only)
router.post('/test', protect, authorize('admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('type').optional().isIn(['welcome', 'notification', 'test']).withMessage('Invalid email type')
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

    const { email, type = 'test' } = req.body;

    let result;

    switch (type) {
      case 'welcome':
        // Test welcome email
        const testUser = {
          firstName: 'Test',
          lastName: 'User',
          email: email,
          role: 'customer'
        };
        result = await emailService.sendWelcomeEmail(testUser);
        break;

      case 'notification':
        // Test notification email
        result = await emailService.sendNotificationEmail(
          email,
          '🧪 Test Notification - MarketPlace',
          `<h3>Email Service Test</h3>
           <p>This is a test notification to verify that your Gmail integration is working correctly.</p>
           <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
           <p>If you received this email, your email service is configured properly! ✅</p>`,
          'info'
        );
        break;

      default:
        // Simple test email
        result = await emailService.sendNotificationEmail(
          email,
          '✅ Gmail Integration Test - MarketPlace',
          `<h2>🎉 Success!</h2>
           <p>Your Gmail integration is working perfectly!</p>
           <p><strong>Test Details:</strong></p>
           <ul>
             <li>Email Host: ${process.env.EMAIL_HOST}</li>
             <li>Email Port: ${process.env.EMAIL_PORT}</li>
             <li>From Email: ${process.env.EMAIL_USER}</li>
             <li>Test Time: ${new Date().toLocaleString()}</li>
           </ul>
           <p>You can now send real-time emails for:</p>
           <ul>
             <li>✅ User registration welcome emails</li>
             <li>✅ Password reset emails</li>
             <li>✅ Order confirmations</li>
             <li>✅ Vendor notifications</li>
             <li>✅ General notifications</li>
           </ul>`,
          'success'
        );
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        type: type
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email test',
      error: error.message
    });
  }
});

// @desc    Send custom notification email
// @route   POST /api/email/notify
// @access  Private (Admin only)
router.post('/notify', protect, authorize('admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error']).withMessage('Invalid notification type')
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

    const { email, subject, message, type = 'info' } = req.body;

    const result = await emailService.sendNotificationEmail(email, subject, message, type);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Notification email sent successfully to ${email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email sending',
      error: error.message
    });
  }
});

// @desc    Get email service status
// @route   GET /api/email/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), async (req, res) => {
  try {
    // Check email service configuration
    const config = {
      host: process.env.EMAIL_HOST || 'Not configured',
      port: process.env.EMAIL_PORT || 'Not configured',
      user: process.env.EMAIL_USER || 'Not configured',
      hasPassword: !!process.env.EMAIL_PASS,
      frontendUrl: process.env.FRONTEND_URL || 'Not configured'
    };

    // Test connection (this will be logged in console)
    const emailService = require('../services/emailService');
    
    res.status(200).json({
      success: true,
      message: 'Email service status retrieved',
      config: config,
      note: 'Check server console for connection status'
    });

  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving email status',
      error: error.message
    });
  }
});

module.exports = router;
