# Multi-Vendor E-commerce Platform

A comprehensive online marketplace built with the MERN stack where multiple vendors can register, list products, and manage their sales.

## 🚀 Features

### 👤 Customer Features
- Browse and search products with advanced filtering
- Product details with reviews and ratings
- Shopping cart and secure checkout
- Payment integration (Stripe, PayPal)
- Order tracking and history
- Wishlist functionality
- User profile management

### 🛒 Vendor/Seller Features
- Seller registration and verification
- Comprehensive vendor dashboard
- Product management (add/edit/delete)
- Sales and revenue analytics
- Order management system
- Inventory tracking
- Customer messaging system

### 👨‍💼 Admin Features
- Admin dashboard with comprehensive analytics
- Vendor application approval system
- User and product management
- Category and brand management
- Sales reports and commission tracking
- Dispute resolution system
- CMS for static pages and banners

## 🛠️ Tech Stack

- **Frontend**: React.js with modern hooks and context API
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe & PayPal integration
- **File Upload**: Multer for image handling
- **Styling**: CSS3 with responsive design

## 📁 Project Structure

```
Multi-Vendor E-commerce Platform/
├── backend/                 # Express.js API server
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── uploads/           # File upload directory
├── frontend/              # React.js application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # CSS files
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Multi-Vendor-E-commerce-Platform
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables (see .env.example files)

5. Start the development servers
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm start
```

## 🔧 Environment Variables

Create `.env` files in both backend and frontend directories with the required variables.

## 📝 API Documentation

API endpoints are documented and available at `/api/docs` when running the development server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
