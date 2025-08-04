import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const OrderSuccess = () => {
  return (
    <>
      <Helmet>
        <title>Order Successful - MarketPlace</title>
        <meta name="description" content="Your order has been placed successfully" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <div className="text-center py-20">
            <i className="fas fa-check-circle text-6xl text-success mb-4"></i>
            <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-secondary mb-8">
              Thank you for your purchase. You will receive an email confirmation shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/profile" className="btn btn-primary">
                <i className="fas fa-user"></i>
                View Orders
              </Link>
              <Link to="/products" className="btn btn-secondary">
                <i className="fas fa-shopping-bag"></i>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
