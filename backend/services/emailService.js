const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: `"MarketPlace" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Welcome to MarketPlace!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 10px; overflow: hidden;">
          <div style="background: white; margin: 20px; border-radius: 10px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 12px; color: white; font-size: 24px; font-weight: bold; line-height: 60px;">E</div>
              <h1 style="color: #1e293b; margin: 10px 0;">MarketPlace</h1>
            </div>
            
            <h2 style="color: #ff7a45; text-align: center;">Welcome, ${user.firstName}! 🎉</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Thank you for joining MarketPlace! We're excited to have you as part of our growing community.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Your Account Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p style="margin: 5px 0;"><strong>Joined:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${user.role === 'vendor' ? `
              <div style="background: #fef3e2; border-left: 4px solid #ff7a45; padding: 15px; margin: 20px 0;">
                <h4 style="color: #ff7a45; margin-top: 0;">🏪 Vendor Account Created!</h4>
                <p style="color: #92400e; margin-bottom: 0;">You can now start uploading products and managing your store. Visit your vendor dashboard to get started!</p>
              </div>
            ` : `
              <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
                <h4 style="color: #0ea5e9; margin-top: 0;">🛒 Customer Account Created!</h4>
                <p style="color: #0c4a6e; margin-bottom: 0;">Start exploring thousands of products from verified vendors. Happy shopping!</p>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Shopping
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
              Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #ff7a45;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"MarketPlace Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Password Reset Request - MarketPlace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 12px; color: white; font-size: 24px; font-weight: bold; line-height: 60px;">E</div>
              <h1 style="color: #1e293b; margin: 10px 0;">MarketPlace</h1>
            </div>
            
            <h2 style="color: #dc2626; text-align: center;">🔐 Password Reset Request</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Hello ${user.firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your MarketPlace account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0; font-weight: bold;">⚠️ Security Notice</p>
              <p style="color: #991b1b; margin: 5px 0 0 0; font-size: 14px;">This reset link will expire in 1 hour for your security.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #ff7a45; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
              If you didn't request this reset, please contact us immediately at <a href="mailto:${process.env.EMAIL_USER}" style="color: #ff7a45;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(user, order) {
    const orderItems = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"MarketPlace Orders" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📦 Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 12px; color: white; font-size: 24px; font-weight: bold; line-height: 60px;">E</div>
              <h1 style="color: #1e293b; margin: 10px 0;">MarketPlace</h1>
            </div>
            
            <h2 style="color: #059669; text-align: center;">📦 Order Confirmed!</h2>
            
            <p style="color: #64748b; font-size: 16px;">
              Hi ${user.firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px;">
              Thank you for your order! We've received your order and it's being processed.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0ea5e9; margin-top: 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            </div>
            
            <h3 style="color: #1e293b;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
              </tbody>
            </table>
            
            <div style="text-align: right; margin: 20px 0;">
              <p style="margin: 5px 0; font-size: 18px;"><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
            </div>
            
            <div style="background: #fef3e2; border-left: 4px solid #ff7a45; padding: 15px; margin: 20px 0;">
              <h4 style="color: #ff7a45; margin-top: 0;">📍 Shipping Address</h4>
              <p style="color: #92400e; margin: 0;">
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Track Your Order
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
              Questions about your order? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #ff7a45;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send vendor application approval email
  async sendVendorApprovalEmail(user) {
    const mailOptions = {
      from: `"MarketPlace Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Vendor Application Approved - MarketPlace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 10px; overflow: hidden;">
          <div style="background: white; margin: 20px; border-radius: 10px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 12px; color: white; font-size: 24px; font-weight: bold; line-height: 60px;">E</div>
              <h1 style="color: #1e293b; margin: 10px 0;">MarketPlace</h1>
            </div>
            
            <h2 style="color: #059669; text-align: center;">🎉 Congratulations! You're Now a Vendor!</h2>
            
            <p style="color: #64748b; font-size: 16px;">
              Hi ${user.firstName},
            </p>
            
            <p style="color: #64748b; font-size: 16px;">
              Great news! Your vendor application has been approved. You can now start selling on MarketPlace!
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
              <h4 style="color: #059669; margin-top: 0;">🏪 What's Next?</h4>
              <ul style="color: #166534; margin: 0; padding-left: 20px;">
                <li>Set up your vendor profile</li>
                <li>Upload your first products</li>
                <li>Configure your store settings</li>
                <li>Start receiving orders!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/vendor/dashboard" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Access Vendor Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
              Need help getting started? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #ff7a45;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Vendor approval email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send vendor approval email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send generic notification email
  async sendNotificationEmail(to, subject, message, type = 'info') {
    const colors = {
      info: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0c4a6e' },
      success: { bg: '#f0fdf4', border: '#059669', text: '#166534' },
      warning: { bg: '#fef3e2', border: '#ff7a45', text: '#92400e' },
      error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' }
    };

    const color = colors[type] || colors.info;

    const mailOptions = {
      from: `"MarketPlace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ff7a45 0%, #ff9500 100%); border-radius: 12px; color: white; font-size: 24px; font-weight: bold; line-height: 60px;">E</div>
              <h1 style="color: #1e293b; margin: 10px 0;">MarketPlace</h1>
            </div>
            
            <div style="background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 15px; margin: 20px 0;">
              <div style="color: ${color.text};">
                ${message}
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
              This is an automated message from MarketPlace. For support, contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #ff7a45;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notification email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
