import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorApplication from './pages/vendor/Application';
import AddProduct from './pages/vendor/AddProduct';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVendors from './pages/admin/Vendors';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCategories from './pages/admin/Categories';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminCustomers from './pages/admin/Customers';
import VendorStore from './pages/VendorStore';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

// Styles
import './styles/App.css';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = true; // Include cookies in requests
axios.defaults.timeout = 10000; // 10 second timeout

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/vendor/:id" element={<VendorStore />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/order-success" element={<OrderSuccess />} />

                      {/* Protected Customer Routes */}
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/checkout" 
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Vendor Routes */}
                      <Route 
                        path="/vendor/apply" 
                        element={
                          <ProtectedRoute allowedRoles={['customer']}>
                            <VendorApplication />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vendor/dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={['vendor']}>
                            <VendorDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vendor/products" 
                        element={
                          <ProtectedRoute allowedRoles={['vendor']}>
                            <VendorProducts />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vendor/orders" 
                        element={
                          <ProtectedRoute allowedRoles={['vendor']}>
                            <VendorOrders />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vendor/products/add" 
                        element={
                          <ProtectedRoute allowedRoles={['vendor']}>
                            <AddProduct />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/vendor/products/edit/:id" 
                        element={
                          <ProtectedRoute allowedRoles={['vendor']}>
                            <AddProduct />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Admin Routes */}
                      <Route 
                        path="/admin/dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/admin/users" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminUsers />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/customers" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminCustomers />
                        </ProtectedRoute>
                      } />
                      <Route 
                        path="/admin/vendors" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminVendors />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/products" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminProducts />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/orders" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminOrders />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/categories" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminCategories />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/reports" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminReports />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/settings" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminSettings />
                          </ProtectedRoute>
                        } 
                      />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4ade80',
                      secondary: '#000',
                    },
                  },
                  error: {
                    duration: 4000,
                    theme: {
                      primary: '#ef4444',
                      secondary: '#000',
                    },
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
