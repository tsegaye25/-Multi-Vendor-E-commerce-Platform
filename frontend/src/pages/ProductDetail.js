import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Product Details - MarketPlace</title>
        <meta name="description" content="View product details" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <div className="text-center py-20">
            <i className="fas fa-box text-6xl text-secondary mb-4"></i>
            <h1 className="text-3xl font-bold mb-4">Product Details</h1>
            <p className="text-secondary mb-4">Product ID: {id}</p>
            <p className="text-secondary">
              Product detail functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
