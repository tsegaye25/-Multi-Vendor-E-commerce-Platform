import React from 'react';
import { Helmet } from 'react-helmet-async';

const VendorOrders = () => {
  return (
    <>
      <Helmet>
        <title>My Orders - MarketPlace</title>
        <meta name="description" content="Manage your orders" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="text-center py-20">
            <i className="fas fa-shopping-bag text-6xl text-secondary mb-4"></i>
            <h2 className="text-2xl font-semibold mb-4">Order Management Coming Soon</h2>
            <p className="text-secondary">
              Order management functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorOrders;
