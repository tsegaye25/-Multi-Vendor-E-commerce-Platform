import React from 'react';
import { Helmet } from 'react-helmet-async';

const VendorApplication = () => {
  return (
    <>
      <Helmet>
        <title>Become a Vendor - MarketPlace</title>
        <meta name="description" content="Apply to become a vendor" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8">Become a Vendor</h1>
          <div className="text-center py-20">
            <i className="fas fa-store text-6xl text-secondary mb-4"></i>
            <h2 className="text-2xl font-semibold mb-4">Vendor Application Coming Soon</h2>
            <p className="text-secondary">
              Vendor application process will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorApplication;
