import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, getCartTotals } = useCart();
  const { subtotal, tax, shipping, total, itemCount } = getCartTotals();

  return (
    <>
      <Helmet>
        <title>Shopping Cart - MarketPlace</title>
        <meta name="description" content="Review your shopping cart" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-20">
              <i className="fas fa-shopping-cart text-6xl text-secondary mb-4"></i>
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-secondary mb-8">
                Start shopping to add items to your cart.
              </p>
              <a href="/products" className="btn btn-primary">
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="card-body">
                    <p>Cart functionality will be implemented soon.</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold">Order Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${shipping}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
