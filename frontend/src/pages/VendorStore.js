import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const VendorStore = () => {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Vendor Store - MarketPlace</title>
        <meta name="description" content="Browse vendor products" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <div className="text-center py-20">
            <i className="fas fa-store text-6xl text-secondary mb-4"></i>
            <h1 className="text-3xl font-bold mb-4">Vendor Store</h1>
            <p className="text-secondary mb-4">Vendor ID: {id}</p>
            <p className="text-secondary">
              Vendor store functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorStore;
