import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          MarketPlace
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/products">Products</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/cart" className="flex items-center gap-2">
                  <i className="fas fa-shopping-cart"></i>
                  Cart ({cartItemCount})
                </Link>
              </li>
              
              {user?.role === 'vendor' && (
                <li>
                  <Link to="/vendor/dashboard">Dashboard</Link>
                </li>
              )}
              
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin/dashboard">Admin</Link>
                </li>
              )}
              
              <li>
                <Link to="/profile">
                  <i className="fas fa-user"></i>
                  {user?.firstName}
                </Link>
              </li>
              
              <li>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/cart" className="flex items-center gap-2">
                  <i className="fas fa-shopping-cart"></i>
                  Cart ({cartItemCount})
                </Link>
              </li>
              <li>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
