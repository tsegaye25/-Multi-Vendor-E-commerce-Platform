import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await axios.get(`/api/admin/orders?${params}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get('/api/admin/orders/stats');
      setOrderStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/admin/orders/${orderId}`);
      setSelectedOrder(response.data.order);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update this order status to ${newStatus}?`)) {
      try {
        setActionLoading(true);
        await axios.put(`/api/admin/orders/${orderId}/status`, {
          status: newStatus
        });
        toast.success('Order status updated successfully');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'confirmed': return 'badge-info';
      case 'processing': return 'badge-primary';
      case 'shipped': return 'badge-accent';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-error';
      case 'refunded': return 'badge-secondary';
      default: return 'badge-neutral';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Orders - MarketPlace</title>
        <meta name="description" content="Manage all orders on the platform" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Order Management</h1>
            <div className="text-sm text-secondary">
              Total Orders: {orderStats.totalOrders || 0}
            </div>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-warning">
                <i className="fas fa-clock text-2xl"></i>
              </div>
              <div className="stat-title">Pending Orders</div>
              <div className="stat-value text-warning">{orderStats.pendingOrders || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-primary">
                <i className="fas fa-cog text-2xl"></i>
              </div>
              <div className="stat-title">Processing</div>
              <div className="stat-value text-primary">{orderStats.processingOrders || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-success">
                <i className="fas fa-check-circle text-2xl"></i>
              </div>
              <div className="stat-title">Delivered</div>
              <div className="stat-value text-success">{orderStats.deliveredOrders || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-info">
                <i className="fas fa-dollar-sign text-2xl"></i>
              </div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value text-info">{formatCurrency(orderStats.totalRevenue || 0)}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Search Orders</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name..."
                      className="input input-bordered w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Status Filter</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Date Filter</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search mr-2"></i>
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn btn-outline"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="sm" message="Loading..." />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                  <p className="text-secondary">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <div className="font-mono text-sm">
                                #{order._id.slice(-8).toUpperCase()}
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="font-semibold">
                                  {order.customer?.name || 'Unknown Customer'}
                                </div>
                                <div className="text-sm text-secondary">
                                  {order.customer?.email}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">
                                {order.items?.length || 0} item(s)
                              </div>
                              <div className="text-xs text-secondary">
                                {order.items?.slice(0, 2).map(item => item.product?.name).join(', ')}
                                {order.items?.length > 2 && '...'}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold">
                                {formatCurrency(order.totalAmount)}
                              </div>
                              {order.paymentMethod && (
                                <div className="text-xs text-secondary">
                                  {order.paymentMethod}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <div className="text-sm">
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-sm btn-outline">
                                  <i className="fas fa-ellipsis-v"></i>
                                </label>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                  <li>
                                    <button onClick={() => fetchOrderDetails(order._id)}>
                                      <i className="fas fa-eye"></i>
                                      View Details
                                    </button>
                                  </li>
                                  {order.status === 'pending' && (
                                    <li>
                                      <button 
                                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-check text-success"></i>
                                        Confirm Order
                                      </button>
                                    </li>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <li>
                                      <button 
                                        onClick={() => updateOrderStatus(order._id, 'processing')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-cog text-primary"></i>
                                        Start Processing
                                      </button>
                                    </li>
                                  )}
                                  {order.status === 'processing' && (
                                    <li>
                                      <button 
                                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-shipping-fast text-accent"></i>
                                        Mark as Shipped
                                      </button>
                                    </li>
                                  )}
                                  {order.status === 'shipped' && (
                                    <li>
                                      <button 
                                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-check-circle text-success"></i>
                                        Mark as Delivered
                                      </button>
                                    </li>
                                  )}
                                  {['pending', 'confirmed'].includes(order.status) && (
                                    <li>
                                      <button 
                                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                        disabled={actionLoading}
                                        className="text-error"
                                      >
                                        <i className="fas fa-times"></i>
                                        Cancel Order
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="btn-group">
                        <button
                          className="btn"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          «
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                          if (page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              className={`btn ${currentPage === page ? 'btn-active' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          className="btn"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setShowOrderModal(false)}
          onStatusUpdate={updateOrderStatus}
          actionLoading={actionLoading}
        />
      )}
    </>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onStatusUpdate, actionLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Order Details: #{order._id.slice(-8).toUpperCase()}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Order Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
                <p><strong>Status:</strong> 
                  <span className={`badge ml-2 ${
                    order.status === 'pending' ? 'badge-warning' :
                    order.status === 'confirmed' ? 'badge-info' :
                    order.status === 'processing' ? 'badge-primary' :
                    order.status === 'shipped' ? 'badge-accent' :
                    order.status === 'delivered' ? 'badge-success' :
                    order.status === 'cancelled' ? 'badge-error' :
                    'badge-secondary'
                  }`}>
                    {order.status}
                  </span>
                </p>
                <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus || 'N/A'}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {order.customer?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {order.customer?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="card bg-base-200 mt-6">
            <div className="card-body">
              <h4 className="card-title text-base">Shipping Address</h4>
              <div className="text-sm">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Order Items</h4>
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center gap-3">
                        {item.product?.images?.[0] && (
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={item.product.images[0].url} alt={item.product.name} />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{item.product?.name || 'Unknown Product'}</div>
                          {item.variant && (
                            <div className="text-xs text-secondary">
                              {item.variant.option}: {item.variant.value}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{item.vendor?.businessName || 'Unknown Vendor'}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Actions */}
        <div className="modal-action">
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <button 
                className="btn btn-success btn-sm"
                onClick={() => onStatusUpdate(order._id, 'confirmed')}
                disabled={actionLoading}
              >
                Confirm Order
              </button>
            )}
            {order.status === 'confirmed' && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onStatusUpdate(order._id, 'processing')}
                disabled={actionLoading}
              >
                Start Processing
              </button>
            )}
            {order.status === 'processing' && (
              <button 
                className="btn btn-accent btn-sm"
                onClick={() => onStatusUpdate(order._id, 'shipped')}
                disabled={actionLoading}
              >
                Mark as Shipped
              </button>
            )}
            {order.status === 'shipped' && (
              <button 
                className="btn btn-success btn-sm"
                onClick={() => onStatusUpdate(order._id, 'delivered')}
                disabled={actionLoading}
              >
                Mark as Delivered
              </button>
            )}
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
