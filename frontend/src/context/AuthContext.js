import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state - check for existing authentication
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token') || Cookies.get('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      return {
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Error loading initial auth state:', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  };
};

const initialState = getInitialState();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  const setAuthToken = (token, user = null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Store token in multiple places for reliability
      Cookies.set('token', token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
        sameSite: 'strict', // CSRF protection
        path: '/' // Available throughout the app
      });
      // Also store in localStorage as backup
      localStorage.setItem('token', token);
      
      // Store user data if provided
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  };

  // Load user from token
  const loadUser = async () => {
    try {
      console.log('🔍 AuthContext: Starting loadUser...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check for token in cookies first, then localStorage as fallback
      let token = Cookies.get('token');
      if (!token) {
        token = localStorage.getItem('token');
        console.log('🔄 Fallback to localStorage token:', token ? 'Found' : 'Not found');
      } else {
        console.log('🍪 Token from cookies:', 'Found');
      }
      
      if (token) {
        console.log('🔑 Setting token in axios headers...');
        // Set the token in axios headers before making the request
        setAuthToken(token);
        
        try {
          console.log('📡 Making request to /api/auth/me...');
          // Try to get user data with the token
          const response = await axios.get('/api/auth/me');
          console.log('✅ Auth response:', response.data);
          
          if (response.data.success) {
            console.log('👤 User authenticated successfully:', response.data.user.email);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.user,
                token
              }
            });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('❌ Load user API error:', error.response?.data || error.message);
          // If token is invalid or expired, clear it
          dispatch({ type: 'LOGOUT' });
          setAuthToken(null);
        }
      } else {
        console.log('🚫 No token found anywhere, user not authenticated');
        // No token found, user is not authenticated
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('💥 Load user general error:', error);
      dispatch({ type: 'LOGOUT' });
      setAuthToken(null);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🚀 AuthContext: Starting login for:', email);
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      console.log('✅ Login response:', response.data);

      const { token, user } = response.data;
      console.log('🔑 Token received:', token ? 'Yes' : 'No');
      console.log('👤 User data:', user);

      setAuthToken(token, user);
      console.log('🍪 Token and user data stored persistently');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('/api/auth/register', userData);

      const { token, user } = response.data;

      setAuthToken(token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out and clearing all authentication data...');
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully!');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await axios.put('/api/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
