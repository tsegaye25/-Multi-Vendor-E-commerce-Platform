import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await axios.get(`/api/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`);
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this user account?`)) {
      try {
        setActionLoading(true);
        const reason = prompt('Please provide a reason for this action:');
        if (!reason) return;

        await axios.put(`/api/admin/users/${userId}/status`, {
          isActive: !currentStatus,
          reason
        });

        toast.success(`User account ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchUsers();
      } catch (error) {
        console.error('Error updating user status:', error);
        toast.error('Failed to update user status');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await axios.delete(`/api/admin/users/${userId}`);
        toast.success('User account deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Users - MarketPlace</title>
        <meta name="description" content="Manage all users on the platform" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="text-sm text-secondary">
              Total Users: {users.length > 0 ? users[0]?.total || users.length : 0}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="label">
                    <span className="label-text">Search Users</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Role Filter</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search mr-2"></i>
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                    setCurrentPage(1);
                  }}
                  className="btn btn-outline"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear
                </button>
              </form>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="sm" message="Loading..." />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-users text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                  <p className="text-secondary">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Last Login</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                                    <span className="text-sm">
                                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-secondary">
                                    ID: {user._id.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">{user.email}</div>
                              {user.isEmailVerified ? (
                                <span className="badge badge-success badge-xs">
                                  Verified
                                </span>
                              ) : (
                                <span className="badge badge-warning badge-xs">
                                  Unverified
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${
                                user.role === 'admin' ? 'badge-error' :
                                user.role === 'vendor' ? 'badge-warning' :
                                'badge-info'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                user.isActive ? 'badge-success' : 'badge-error'
                              }`}>
                                {user.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="text-sm text-secondary">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="text-sm text-secondary">
                              {user.lastLogin ? 
                                new Date(user.lastLogin).toLocaleDateString() : 
                                'Never'
                              }
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => fetchUserDetails(user._id)}
                                  className="btn btn-sm btn-info"
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  onClick={() => toggleUserStatus(user._id, user.isActive)}
                                  className={`btn btn-sm ${
                                    user.isActive ? 'btn-warning' : 'btn-success'
                                  }`}
                                  disabled={actionLoading}
                                  title={user.isActive ? 'Disable User' : 'Enable User'}
                                >
                                  <i className={`fas ${
                                    user.isActive ? 'fa-ban' : 'fa-check'
                                  }`}></i>
                                </button>
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="btn btn-sm btn-error"
                                  disabled={actionLoading}
                                  title="Delete User"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                User Details: {selectedUser.user.firstName} {selectedUser.user.lastName}
              </h3>
              <button
                className="btn btn-sm btn-circle"
                onClick={() => setShowUserModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-base">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedUser.user.firstName} {selectedUser.user.lastName}</p>
                    <p><strong>Email:</strong> {selectedUser.user.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.user.phone || 'Not provided'}</p>
                    <p><strong>Role:</strong> <span className="badge badge-info">{selectedUser.user.role}</span></p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ml-2 ${
                        selectedUser.user.isActive ? 'badge-success' : 'badge-error'
                      }`}>
                        {selectedUser.user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </p>
                    <p><strong>Email Verified:</strong> 
                      <span className={`badge ml-2 ${
                        selectedUser.user.isEmailVerified ? 'badge-success' : 'badge-warning'
                      }`}>
                        {selectedUser.user.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <h4 className="card-title text-base">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Orders:</strong> {selectedUser.statistics.totalOrders}</p>
                    <p><strong>Total Spent:</strong> ${selectedUser.statistics.totalSpent.toFixed(2)}</p>
                    <p><strong>Joined:</strong> {new Date(selectedUser.statistics.joinedDate).toLocaleDateString()}</p>
                    <p><strong>Last Login:</strong> 
                      {selectedUser.statistics.lastLogin ? 
                        new Date(selectedUser.statistics.lastLogin).toLocaleDateString() : 
                        'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {selectedUser.orders && selectedUser.orders.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recent Orders</h4>
                <div className="overflow-x-auto">
                  <table className="table table-compact w-full">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.orders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-xs">#{order._id.slice(-8)}</td>
                          <td>{order.vendor?.businessName}</td>
                          <td>${order.pricing?.total?.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-xs ${
                              order.status === 'delivered' ? 'badge-success' :
                              order.status === 'shipped' ? 'badge-info' :
                              order.status === 'processing' ? 'badge-warning' :
                              'badge-secondary'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-xs">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowUserModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
