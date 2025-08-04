import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - MarketPlace</title>
        <meta name="description" content="Admin dashboard with comprehensive management tools" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="text-sm text-secondary">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                    <p className="text-primary-light">Total Users</p>
                  </div>
                  <i className="fas fa-users text-3xl opacity-80"></i>
                </div>
              </div>
            </div>

            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{stats?.totalVendors || 0}</h3>
                    <p className="text-success-light">Total Vendors</p>
                  </div>
                  <i className="fas fa-store text-3xl opacity-80"></i>
                </div>
              </div>
            </div>

            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{stats?.totalProducts || 0}</h3>
                    <p className="text-warning-light">Total Products</p>
                  </div>
                  <i className="fas fa-boxes text-3xl opacity-80"></i>
                </div>
              </div>
            </div>

            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
                    <p className="text-info-light">Total Orders</p>
                  </div>
                  <i className="fas fa-shopping-cart text-3xl opacity-80"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fas fa-users-cog mr-2 text-primary"></i>
                  User Management
                </h3>
                <p className="text-secondary mb-4">
                  Manage customer accounts, view profiles, and handle user issues.
                </p>
                <Link to="/admin/users" className="btn btn-primary">
                  <i className="fas fa-users mr-2"></i>
                  Manage Users
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fas fa-store mr-2 text-success"></i>
                  Vendor Management
                </h3>
                <p className="text-secondary mb-4">
                  Review applications, manage vendor accounts, and monitor performance.
                </p>
                <div className="flex gap-2">
                  <Link to="/admin/vendors" className="btn btn-success">
                    <i className="fas fa-store mr-2"></i>
                    All Vendors
                  </Link>
                  {stats?.pendingVendors > 0 && (
                    <Link to="/admin/vendors?status=pending" className="btn btn-warning">
                      <i className="fas fa-clock mr-2"></i>
                      Pending ({stats.pendingVendors})
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fas fa-boxes mr-2 text-warning"></i>
                  Product Management
                </h3>
                <p className="text-secondary mb-4">
                  Monitor products, handle reports, and manage catalog.
                </p>
                <Link to="/admin/products" className="btn btn-warning">
                  <i className="fas fa-boxes mr-2"></i>
                  Manage Products
                </Link>
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          {stats?.revenueStats && (
            <div className="card mb-8">
              <div className="card-body">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fas fa-chart-line mr-2 text-success"></i>
                  Revenue Statistics (Last 30 Days)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-success">
                      ${stats.revenueStats.totalRevenue?.toFixed(2) || '0.00'}
                    </h4>
                    <p className="text-secondary">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-primary">
                      {stats.revenueStats.totalOrders || 0}
                    </h4>
                    <p className="text-secondary">Orders Completed</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-warning">
                      ${stats.revenueStats.averageOrderValue?.toFixed(2) || '0.00'}
                    </h4>
                    <p className="text-secondary">Average Order Value</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <div className="card">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <i className="fas fa-shopping-bag mr-2 text-info"></i>
                    Recent Orders
                  </h3>
                  <Link to="/admin/orders" className="btn btn-outline btn-sm">
                    View All Orders
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-sm">
                            #{order._id.slice(-8)}
                          </td>
                          <td>
                            {order.customer?.firstName} {order.customer?.lastName}
                          </td>
                          <td>{order.vendor?.businessName}</td>
                          <td className="font-semibold">
                            ${order.pricing?.total?.toFixed(2)}
                          </td>
                          <td>
                            <span className={`badge ${
                              order.status === 'delivered' ? 'badge-success' :
                              order.status === 'shipped' ? 'badge-info' :
                              order.status === 'processing' ? 'badge-warning' :
                              'badge-secondary'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-sm text-secondary">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
