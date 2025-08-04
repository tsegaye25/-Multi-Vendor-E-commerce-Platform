import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="loading-spinner">
      <div className="flex flex-col items-center gap-4">
        <div className={`spinner ${sizeClasses[size]}`}></div>
        {message && <p className="text-secondary">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
