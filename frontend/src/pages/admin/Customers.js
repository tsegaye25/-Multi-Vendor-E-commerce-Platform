import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  const customersPerPage = 10;

  // Fetch customers
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: customersPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        dateFilter
      });

      const response = await axios.get(`/api/admin/customers?${params}`);
      
      if (response.data.success) {
        setCustomers(response.data.customers);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer orders
  const fetchCustomerOrders = async (customerId) => {
    try {
      const response = await axios.get(`/api/admin/customers/${customerId}/orders`);
      if (response.data.success) {
        setCustomerOrders(response.data.orders);
        setShowOrdersModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('Failed to fetch customer orders');
    }
  };

  // Toggle customer status
  const toggleCustomerStatus = async (customerId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    const confirmMessage = `Are you sure you want to ${action} this customer account?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await axios.put(`/api/admin/customers/${customerId}/status`, {
        isActive: !currentStatus
      });

      if (response.data.success) {
        toast.success(`Customer account ${action}d successfully`);
        fetchCustomers(currentPage);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error(`Failed to ${action} customer account`);
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId, customerEmail) => {
    const confirmMessage = `Are you sure you want to DELETE customer "${customerEmail}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;

    const doubleConfirm = window.prompt('Type "DELETE" to confirm this action:');
    if (doubleConfirm !== 'DELETE') {
      toast.error('Deletion cancelled');
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/customers/${customerId}`);

      if (response.data.success) {
        toast.success('Customer deleted successfully');
        fetchCustomers(currentPage);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  // View customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.isActive) ||
                         (statusFilter === 'inactive' && !customer.isActive);
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter, dateFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-success">Active</span>
    ) : (
      <span className="badge badge-error">Inactive</span>
    );
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Customer Management - Admin Dashboard</title>
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor customer accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Customers</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
            <select
              className="select select-bordered w-full"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="btn btn-outline w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                            <span className="text-xl">
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm opacity-50">ID: {customer._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || 'Not provided'}</td>
                    <td>{getStatusBadge(customer.isActive)}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>{customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="btn btn-sm btn-ghost"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => fetchCustomerOrders(customer._id)}
                          className="btn btn-sm btn-ghost"
                          title="View Orders"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => toggleCustomerStatus(customer._id, customer.isActive)}
                          className={`btn btn-sm ${customer.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={customer.isActive ? 'Disable Account' : 'Enable Account'}
                        >
                          {customer.isActive ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => deleteCustomer(customer._id, customer.email)}
                          className="btn btn-sm btn-error"
                          title="Delete Customer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-4">
            <div className="btn-group">
              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => fetchCustomers(currentPage - 1)}
              >
                «
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                  onClick={() => fetchCustomers(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => fetchCustomers(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Customer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedCustomer.isActive)}</p>
                  <p><strong>Email Verified:</strong> {selectedCustomer.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <div className="space-y-2">
                  <p><strong>Customer ID:</strong> {selectedCustomer._id}</p>
                  <p><strong>Joined:</strong> {formatDate(selectedCustomer.createdAt)}</p>
                  <p><strong>Last Login:</strong> {selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : 'Never'}</p>
                  <p><strong>Login Attempts:</strong> {selectedCustomer.loginAttempts || 0}</p>
                </div>
              </div>
            </div>

            {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Addresses</h4>
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((address, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">{address.type} {address.isDefault && '(Default)'}</p>
                      <p>{address.street}, {address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders Modal */}
      {showOrdersModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-6xl">
            <h3 className="font-bold text-lg mb-4">Customer Order History</h3>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-8)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.items.length} items</td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'delivered' ? 'badge-success' :
                            order.status === 'cancelled' ? 'badge-error' :
                            order.status === 'processing' ? 'badge-warning' :
                            'badge-info'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowOrdersModal(false)}
                className="btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
