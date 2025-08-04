import React from 'react';
import { Helmet } from 'react-helmet-async';

const Checkout = () => {
  return (
    <>
      <Helmet>
        <title>Checkout - MarketPlace</title>
        <meta name="description" content="Complete your purchase" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="text-center py-20">
            <i className="fas fa-credit-card text-6xl text-secondary mb-4"></i>
            <h2 className="text-2xl font-semibold mb-4">Checkout Coming Soon</h2>
            <p className="text-secondary">
              Secure checkout functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
