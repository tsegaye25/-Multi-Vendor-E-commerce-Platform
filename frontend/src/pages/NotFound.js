import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - MarketPlace</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="container">
        <div className="text-center py-20">
          <div className="text-8xl text-secondary mb-8">404</div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-secondary text-lg mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i>
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
