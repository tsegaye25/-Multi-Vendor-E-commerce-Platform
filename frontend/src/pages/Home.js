import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBecomeVendor = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Not logged in - redirect to login
      navigate('/login');
      return;
    }
    
    switch (user?.role) {
      case 'vendor':
        // Already a vendor - go to dashboard
        navigate('/vendor/dashboard');
        break;
      case 'admin':
        // Admin can access vendor features
        navigate('/vendor/dashboard');
        break;
      case 'customer':
      default:
        // Customer or other - apply to become vendor
        navigate('/vendor/apply');
        break;
    }
  };

  return (
    <>
      <Helmet>
        <title>MarketPlace - Multi-Vendor E-commerce Platform</title>
        <meta name="description" content="Discover amazing products from trusted vendors on our multi-vendor marketplace" />
      </Helmet>

      <div className="container">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to MarketPlace
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Discover amazing products from trusted vendors around the world. 
            Shop with confidence on our secure multi-vendor platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="btn btn-primary btn-lg">
              <i className="fas fa-shopping-bag"></i>
              Shop Now
            </Link>
            <button onClick={handleBecomeVendor} className="btn btn-secondary btn-lg">
              <i className="fas fa-store"></i>
              {isAuthenticated && user?.role === 'vendor' ? 'Vendor Dashboard' : 'Become a Vendor'}
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MarketPlace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Shopping</h3>
              <p className="text-secondary">
                Shop with confidence knowing your transactions are protected by industry-leading security measures.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Vendors</h3>
              <p className="text-secondary">
                All our vendors are carefully vetted and approved to ensure you get quality products and service.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-secondary">
                Get your orders delivered quickly with our network of reliable shipping partners.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center bg-secondary rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-lg text-secondary mb-8">
            Join thousands of satisfied customers who trust MarketPlace for their shopping needs.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            <i className="fas fa-user-plus"></i>
            Create Account
          </Link>
        </section>
      </div>
    </>
  );
};

export default Home;
