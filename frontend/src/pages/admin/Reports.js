import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [vendorReports, setVendorReports] = useState([]);
  const [productReports, setProductReports] = useState([]);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [overview, sales, vendors, products, users] = await Promise.all([
        axios.get(`/api/admin/reports/overview?period=${dateRange}`),
        axios.get(`/api/admin/reports/sales?period=${dateRange}`),
        axios.get(`/api/admin/reports/vendors?period=${dateRange}`),
        axios.get(`/api/admin/reports/products?period=${dateRange}`),
        axios.get(`/api/admin/reports/users?period=${dateRange}`)
      ]);

      setReportData(overview.data);
      setSalesData(sales.data.salesData || []);
      setVendorReports(vendors.data.vendors || []);
      setProductReports(products.data.products || []);
      setUserReports(users.data.users || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType) => {
    try {
      const response = await axios.get(`/api/admin/reports/export/${reportType}?period=${dateRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${reportType} report exported successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  return (
    <>
      <Helmet>
        <title>Reports & Analytics - MarketPlace</title>
        <meta name="description" content="View comprehensive business reports and analytics" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <div className="flex gap-2">
              <select
                className="select select-bordered"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last 12 Months</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'sales' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              <i className="fas fa-dollar-sign mr-2"></i>
              Sales
            </button>
            <button 
              className={`tab ${activeTab === 'vendors' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('vendors')}
            >
              <i className="fas fa-store mr-2"></i>
              Vendors
            </button>
            <button 
              className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fas fa-boxes mr-2"></i>
              Products
            </button>
            <button 
              className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users mr-2"></i>
              Users
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-lg">
                  <div className="stat-figure">
                    <i className="fas fa-dollar-sign text-2xl opacity-80"></i>
                  </div>
                  <div className="stat-title text-primary-content opacity-80">Total Revenue</div>
                  <div className="stat-value">{formatCurrency(reportData.totalRevenue)}</div>
                  <div className="stat-desc text-primary-content opacity-70">
                    {reportData.revenueGrowth > 0 ? '+' : ''}{formatPercentage(reportData.revenueGrowth)} from last period
                  </div>
                </div>

                <div className="stat bg-gradient-to-r from-success to-success-focus text-success-content rounded-lg">
                  <div className="stat-figure">
                    <i className="fas fa-shopping-cart text-2xl opacity-80"></i>
                  </div>
                  <div className="stat-title text-success-content opacity-80">Total Orders</div>
                  <div className="stat-value">{formatNumber(reportData.totalOrders)}</div>
                  <div className="stat-desc text-success-content opacity-70">
                    {reportData.orderGrowth > 0 ? '+' : ''}{formatPercentage(reportData.orderGrowth)} from last period
                  </div>
                </div>

                <div className="stat bg-gradient-to-r from-info to-info-focus text-info-content rounded-lg">
                  <div className="stat-figure">
                    <i className="fas fa-users text-2xl opacity-80"></i>
                  </div>
                  <div className="stat-title text-info-content opacity-80">New Customers</div>
                  <div className="stat-value">{formatNumber(reportData.newCustomers)}</div>
                  <div className="stat-desc text-info-content opacity-70">
                    {reportData.customerGrowth > 0 ? '+' : ''}{formatPercentage(reportData.customerGrowth)} from last period
                  </div>
                </div>

                <div className="stat bg-gradient-to-r from-warning to-warning-focus text-warning-content rounded-lg">
                  <div className="stat-figure">
                    <i className="fas fa-store text-2xl opacity-80"></i>
                  </div>
                  <div className="stat-title text-warning-content opacity-80">Active Vendors</div>
                  <div className="stat-value">{formatNumber(reportData.activeVendors)}</div>
                  <div className="stat-desc text-warning-content opacity-70">
                    {reportData.vendorGrowth > 0 ? '+' : ''}{formatPercentage(reportData.vendorGrowth)} from last period
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="card-title">Revenue Trend</h3>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => exportReport('revenue')}
                      >
                        <i className="fas fa-download mr-1"></i>
                        Export
                      </button>
                    </div>
                    <div className="h-64 flex items-center justify-center text-secondary">
                      <div className="text-center">
                        <i className="fas fa-chart-line text-4xl mb-2"></i>
                        <p>Revenue chart would be displayed here</p>
                        <p className="text-sm">Integration with Chart.js or similar library needed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="card-title">Order Status Distribution</h3>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => exportReport('orders')}
                      >
                        <i className="fas fa-download mr-1"></i>
                        Export
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Delivered</span>
                        <span className="font-semibold">{formatNumber(reportData.ordersByStatus?.delivered || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Processing</span>
                        <span className="font-semibold">{formatNumber(reportData.ordersByStatus?.processing || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending</span>
                        <span className="font-semibold">{formatNumber(reportData.ordersByStatus?.pending || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cancelled</span>
                        <span className="font-semibold">{formatNumber(reportData.ordersByStatus?.cancelled || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sales Performance</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => exportReport('sales')}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Sales Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Average Order Value</div>
                  <div className="stat-value text-primary">{formatCurrency(reportData.averageOrderValue)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Conversion Rate</div>
                  <div className="stat-value text-success">{formatPercentage(reportData.conversionRate)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Return Rate</div>
                  <div className="stat-value text-warning">{formatPercentage(reportData.returnRate)}</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title mb-4">Top Selling Products</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Sales</th>
                          <th>Revenue</th>
                          <th>Units Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productReports.slice(0, 10).map((product, index) => (
                          <tr key={product._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="font-semibold">{product.name}</div>
                              </div>
                            </td>
                            <td>{formatCurrency(product.totalRevenue)}</td>
                            <td>{formatCurrency(product.totalRevenue)}</td>
                            <td>{formatNumber(product.totalSold)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vendor Performance</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => exportReport('vendors')}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Vendor Report
                </button>
              </div>

              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title mb-4">Top Performing Vendors</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Vendor</th>
                          <th>Revenue</th>
                          <th>Orders</th>
                          <th>Products</th>
                          <th>Rating</th>
                          <th>Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorReports.map((vendor) => (
                          <tr key={vendor._id}>
                            <td>
                              <div>
                                <div className="font-semibold">{vendor.businessName}</div>
                                <div className="text-sm text-secondary">{vendor.email}</div>
                              </div>
                            </td>
                            <td>{formatCurrency(vendor.totalRevenue)}</td>
                            <td>{formatNumber(vendor.totalOrders)}</td>
                            <td>{formatNumber(vendor.productCount)}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span>{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                                <i className="fas fa-star text-yellow-400 text-xs"></i>
                              </div>
                            </td>
                            <td>{formatCurrency(vendor.totalCommission)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Product Analytics</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => exportReport('products')}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Product Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Products</div>
                  <div className="stat-value text-primary">{formatNumber(reportData.totalProducts)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Out of Stock</div>
                  <div className="stat-value text-error">{formatNumber(reportData.outOfStockProducts)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Low Stock</div>
                  <div className="stat-value text-warning">{formatNumber(reportData.lowStockProducts)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">New Products</div>
                  <div className="stat-value text-success">{formatNumber(reportData.newProducts)}</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title mb-4">Product Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Stock</th>
                          <th>Sales</th>
                          <th>Revenue</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productReports.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-sm text-secondary">{product.vendor?.businessName}</div>
                              </div>
                            </td>
                            <td>{product.category?.name || 'Uncategorized'}</td>
                            <td>
                              <span className={`badge ${
                                product.stock <= 0 ? 'badge-error' :
                                product.stock <= 10 ? 'badge-warning' :
                                'badge-success'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td>{formatNumber(product.totalSold)}</td>
                            <td>{formatCurrency(product.totalRevenue)}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                                <i className="fas fa-star text-yellow-400 text-xs"></i>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Analytics</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => exportReport('users')}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export User Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value text-primary">{formatNumber(reportData.totalUsers)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Active Users</div>
                  <div className="stat-value text-success">{formatNumber(reportData.activeUsers)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">New Registrations</div>
                  <div className="stat-value text-info">{formatNumber(reportData.newRegistrations)}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">User Retention</div>
                  <div className="stat-value text-warning">{formatPercentage(reportData.userRetention)}</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title mb-4">Top Customers</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Orders</th>
                          <th>Total Spent</th>
                          <th>Avg Order Value</th>
                          <th>Last Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userReports.slice(0, 10).map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div>
                                <div className="font-semibold">{user.name}</div>
                                <div className="text-sm text-secondary">{user.email}</div>
                              </div>
                            </td>
                            <td>{formatNumber(user.totalOrders)}</td>
                            <td>{formatCurrency(user.totalSpent)}</td>
                            <td>{formatCurrency(user.averageOrderValue)}</td>
                            <td>
                              {user.lastOrderDate ? 
                                new Date(user.lastOrderDate).toLocaleDateString() : 
                                'Never'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default AdminReports;
