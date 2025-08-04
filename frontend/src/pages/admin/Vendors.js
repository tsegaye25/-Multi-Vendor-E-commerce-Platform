import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Set initial status filter from URL params
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/admin/vendors?${params}`);
      setVendors(response.data.vendors);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async (vendorId) => {
    try {
      const response = await axios.get(`/api/admin/vendors/${vendorId}`);
      setSelectedVendor(response.data);
      setShowVendorModal(true);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      toast.error('Failed to load vendor details');
    }
  };

  const approveVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to approve this vendor application?')) {
      try {
        setActionLoading(true);
        await axios.put(`/api/admin/vendors/${vendorId}/status`, {
          status: 'approved'
        });
        toast.success('Vendor application approved successfully');
        fetchVendors();
      } catch (error) {
        console.error('Error approving vendor:', error);
        toast.error('Failed to approve vendor');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const rejectVendor = async (vendorId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        setActionLoading(true);
        await axios.put(`/api/admin/vendors/${vendorId}/status`, {
          status: 'rejected',
          rejectionReason: reason
        });
        toast.success('Vendor application rejected');
        fetchVendors();
      } catch (error) {
        console.error('Error rejecting vendor:', error);
        toast.error('Failed to reject vendor');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const suspendVendor = async (vendorId, currentStatus) => {
    const action = currentStatus ? 'unsuspend' : 'suspend';
    if (window.confirm(`Are you sure you want to ${action} this vendor?`)) {
      try {
        setActionLoading(true);
        const reason = prompt(`Please provide a reason for ${action}ing this vendor:`);
        if (!reason) return;

        await axios.put(`/api/admin/vendors/${vendorId}/suspend`, {
          suspended: !currentStatus,
          reason
        });
        toast.success(`Vendor ${action}ed successfully`);
        fetchVendors();
      } catch (error) {
        console.error(`Error ${action}ing vendor:`, error);
        toast.error(`Failed to ${action} vendor`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const resetPassword = async (vendorId) => {
    const newPassword = prompt('Enter new password for vendor (minimum 6 characters):');
    if (newPassword && newPassword.length >= 6) {
      try {
        setActionLoading(true);
        await axios.put(`/api/admin/vendors/${vendorId}/reset-password`, {
          newPassword
        });
        toast.success('Vendor password reset successfully');
      } catch (error) {
        console.error('Error resetting password:', error);
        toast.error('Failed to reset password');
      } finally {
        setActionLoading(false);
      }
    } else if (newPassword) {
      toast.error('Password must be at least 6 characters long');
    }
  };

  const sendMessage = async (vendorId, messageData) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/admin/vendors/${vendorId}/message`, messageData);
      toast.success('Message sent to vendor successfully');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVendors();
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner message="Loading vendors..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Vendors - MarketPlace</title>
        <meta name="description" content="Manage vendor applications and accounts" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Vendor Management</h1>
            <div className="text-sm text-secondary">
              Total Vendors: {vendors.length > 0 ? vendors[0]?.total || vendors.length : 0}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="label">
                    <span className="label-text">Search Vendors</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search by business name or email..."
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
                    className="select select-bordered"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
                    setStatusFilter('');
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

          {/* Vendors Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="sm" message="Loading..." />
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-store text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Vendors Found</h3>
                  <p className="text-secondary">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Business</th>
                          <th>Owner</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Rating</th>
                          <th>Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendors.map((vendor) => (
                          <tr key={vendor._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                                    <span className="text-sm">
                                      {vendor.businessName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {vendor.businessName}
                                  </div>
                                  <div className="text-sm text-secondary">
                                    ID: {vendor._id.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">
                                {vendor.user?.firstName} {vendor.user?.lastName}
                              </div>
                              <div className="text-xs text-secondary">
                                {vendor.user?.email}
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">{vendor.businessEmail}</div>
                              <div className="text-xs text-secondary">
                                {vendor.businessPhone}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                vendor.status === 'approved' ? 'badge-success' :
                                vendor.status === 'rejected' ? 'badge-error' :
                                'badge-warning'
                              }`}>
                                {vendor.status}
                              </span>
                              {vendor.suspended && (
                                <span className="badge badge-error badge-xs ml-1">
                                  Suspended
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold">
                                  {vendor.ratings?.average?.toFixed(1) || '0.0'}
                                </span>
                                <i className="fas fa-star text-yellow-400 text-xs"></i>
                                <span className="text-xs text-secondary">
                                  ({vendor.ratings?.count || 0})
                                </span>
                              </div>
                            </td>
                            <td className="text-sm text-secondary">
                              {new Date(vendor.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-sm btn-outline">
                                  <i className="fas fa-ellipsis-v"></i>
                                </label>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                  <li>
                                    <button onClick={() => fetchVendorDetails(vendor._id)}>
                                      <i className="fas fa-eye"></i>
                                      View Details
                                    </button>
                                  </li>
                                  {vendor.status === 'pending' && (
                                    <>
                                      <li>
                                        <button 
                                          onClick={() => approveVendor(vendor._id)}
                                          disabled={actionLoading}
                                        >
                                          <i className="fas fa-check text-success"></i>
                                          Approve
                                        </button>
                                      </li>
                                      <li>
                                        <button 
                                          onClick={() => rejectVendor(vendor._id)}
                                          disabled={actionLoading}
                                        >
                                          <i className="fas fa-times text-error"></i>
                                          Reject
                                        </button>
                                      </li>
                                    </>
                                  )}
                                  {vendor.status === 'approved' && (
                                    <li>
                                      <button 
                                        onClick={() => suspendVendor(vendor._id, vendor.suspended)}
                                        disabled={actionLoading}
                                      >
                                        <i className={`fas ${
                                          vendor.suspended ? 'fa-play text-success' : 'fa-ban text-warning'
                                        }`}></i>
                                        {vendor.suspended ? 'Unsuspend' : 'Suspend'}
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <button 
                                      onClick={() => resetPassword(vendor._id)}
                                      disabled={actionLoading}
                                    >
                                      <i className="fas fa-key text-info"></i>
                                      Reset Password
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      onClick={() => {
                                        setSelectedVendor(vendor);
                                        setShowMessageModal(true);
                                      }}
                                    >
                                      <i className="fas fa-envelope text-primary"></i>
                                      Send Message
                                    </button>
                                  </li>
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

      {/* Vendor Details Modal */}
      {showVendorModal && selectedVendor && (
        <VendorDetailsModal 
          vendor={selectedVendor} 
          onClose={() => setShowVendorModal(false)} 
        />
      )}

      {/* Message Modal */}
      {showMessageModal && selectedVendor && (
        <MessageModal 
          vendor={selectedVendor} 
          onClose={() => setShowMessageModal(false)}
          onSend={sendMessage}
          loading={actionLoading}
        />
      )}
    </>
  );
};

// Vendor Details Modal Component
const VendorDetailsModal = ({ vendor, onClose }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Vendor Details: {vendor.vendor.businessName}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Business Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Business Name:</strong> {vendor.vendor.businessName}</p>
                <p><strong>Business Email:</strong> {vendor.vendor.businessEmail}</p>
                <p><strong>Business Phone:</strong> {vendor.vendor.businessPhone}</p>
                <p><strong>Business Type:</strong> {vendor.vendor.businessType}</p>
                <p><strong>Description:</strong> {vendor.vendor.businessDescription}</p>
                <p><strong>Address:</strong> {vendor.vendor.businessAddress?.street}, {vendor.vendor.businessAddress?.city}</p>
                <p><strong>Status:</strong> 
                  <span className={`badge ml-2 ${
                    vendor.vendor.status === 'approved' ? 'badge-success' :
                    vendor.vendor.status === 'rejected' ? 'badge-error' :
                    'badge-warning'
                  }`}>
                    {vendor.vendor.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Owner Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {vendor.vendor.user?.firstName} {vendor.vendor.user?.lastName}</p>
                <p><strong>Email:</strong> {vendor.vendor.user?.email}</p>
                <p><strong>Phone:</strong> {vendor.vendor.user?.phone}</p>
                <p><strong>Joined:</strong> {new Date(vendor.vendor.user?.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Login:</strong> 
                  {vendor.vendor.user?.lastLogin ? 
                    new Date(vendor.vendor.user.lastLogin).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h4 className="card-title text-base">Performance Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {vendor.statistics?.totalProducts || 0}
                </div>
                <div className="text-sm text-secondary">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {vendor.statistics?.activeProducts || 0}
                </div>
                <div className="text-sm text-secondary">Active Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">
                  {vendor.statistics?.totalOrders || 0}
                </div>
                <div className="text-sm text-secondary">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  ${vendor.statistics?.totalEarnings?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-secondary">Total Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        {vendor.products && vendor.products.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Recent Products</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.products.slice(0, 6).map((product) => (
                <div key={product._id} className="card card-compact bg-base-200">
                  <div className="card-body">
                    <h5 className="card-title text-sm">{product.name}</h5>
                    <p className="text-xs text-secondary">Price: ${product.price}</p>
                    <p className="text-xs text-secondary">Stock: {product.stock}</p>
                    <span className={`badge badge-xs ${
                      product.status === 'active' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Message Modal Component
const MessageModal = ({ vendor, onClose, onSend, loading }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    onSend(vendor._id, { subject, message, type });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Send Message to {vendor.businessName}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Message Type</span>
            </label>
            <select 
              className="select select-bordered"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <input 
              type="text"
              className="input input-bordered"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              required
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              required
            ></textarea>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVendors;
