import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => 
        item.product._id === action.payload.product._id &&
        JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product._id === action.payload.product._id &&
            JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Add item to cart
  const addToCart = (product, quantity = 1, variant = null) => {
    const cartItem = {
      id: `${product._id}-${variant ? JSON.stringify(variant) : 'default'}`,
      product,
      quantity,
      variant,
      addedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    toast.success('Item removed from cart');
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: itemId, quantity }
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = state.items.reduce((total, item) => {
      const price = item.product.price.discounted || item.product.price.original;
      return total + (price * item.quantity);
    }, 0);

    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

    // Calculate estimated tax (8% for demo)
    const tax = subtotal * 0.08;

    // Calculate shipping (free over $50, otherwise $5.99)
    const shipping = subtotal >= 50 ? 0 : 5.99;

    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount
    };
  };

  // Check if item is in cart
  const isInCart = (productId, variant = null) => {
    return state.items.some(item => 
      item.product._id === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (productId, variant = null) => {
    const item = state.items.find(item => 
      item.product._id === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    return item ? item.quantity : 0;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
