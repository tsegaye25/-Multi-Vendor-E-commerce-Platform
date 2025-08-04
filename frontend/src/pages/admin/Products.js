import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, vendorFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (vendorFilter) params.append('vendor', vendorFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await axios.get(`/api/admin/products?${params}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/admin/vendors?limit=100');
      setVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.get(`/api/products/${productId}`);
      setSelectedProduct(response.data.product);
      setShowProductModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this product?`)) {
      try {
        setActionLoading(true);
        const reason = prompt(`Please provide a reason for ${newStatus}ing this product:`);
        if (!reason) return;

        await axios.put(`/api/admin/products/${productId}/status`, {
          status: newStatus,
          reason
        });

        toast.success(`Product ${newStatus} successfully`);
        fetchProducts();
      } catch (error) {
        console.error('Error updating product status:', error);
        toast.error('Failed to update product status');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await axios.delete(`/api/admin/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleProductReport = async (productId, reportData) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/admin/products/${productId}/report`, reportData);
      toast.success('Product report submitted successfully');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setVendorFilter('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Products - MarketPlace</title>
        <meta name="description" content="Monitor products, handle reports, and manage catalog" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Product Management</h1>
            <div className="text-sm text-secondary">
              Total Products: {products.length > 0 ? products[0]?.total || products.length : 0}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Search Products</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name or description..."
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
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Vendor Filter</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={vendorFilter}
                      onChange={(e) => setVendorFilter(e.target.value)}
                    >
                      <option value="">All Vendors</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.businessName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Category Filter</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
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

          {/* Products Table */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="sm" message="Loading..." />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-boxes text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                  <p className="text-secondary">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Vendor</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="mask mask-squircle w-12 h-12">
                                    {product.images && product.images.length > 0 ? (
                                      <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="bg-neutral-focus text-neutral-content flex items-center justify-center">
                                        <i className="fas fa-image"></i>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-semibold">{product.name}</div>
                                  <div className="text-sm text-secondary">
                                    ID: {product._id.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">
                                {product.vendor?.businessName || 'Unknown Vendor'}
                              </div>
                            </td>
                            <td>
                              <div className="text-sm">
                                {product.category?.name || 'Uncategorized'}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold">
                                ${product.price?.toFixed(2)}
                              </div>
                              {product.comparePrice && (
                                <div className="text-xs text-secondary line-through">
                                  ${product.comparePrice.toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className={`font-semibold ${
                                product.stock <= 0 ? 'text-error' :
                                product.stock <= 10 ? 'text-warning' :
                                'text-success'
                              }`}>
                                {product.stock}
                              </div>
                              <div className="text-xs text-secondary">
                                {product.stock <= 0 ? 'Out of Stock' :
                                 product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                product.status === 'active' ? 'badge-success' :
                                product.status === 'inactive' ? 'badge-warning' :
                                product.status === 'suspended' ? 'badge-error' :
                                'badge-secondary'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold">
                                  {product.ratings?.average?.toFixed(1) || '0.0'}
                                </span>
                                <i className="fas fa-star text-yellow-400 text-xs"></i>
                                <span className="text-xs text-secondary">
                                  ({product.ratings?.count || 0})
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-sm btn-outline">
                                  <i className="fas fa-ellipsis-v"></i>
                                </label>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                  <li>
                                    <button onClick={() => fetchProductDetails(product._id)}>
                                      <i className="fas fa-eye"></i>
                                      View Details
                                    </button>
                                  </li>
                                  {product.status === 'active' && (
                                    <li>
                                      <button 
                                        onClick={() => updateProductStatus(product._id, 'suspended')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-ban text-warning"></i>
                                        Suspend
                                      </button>
                                    </li>
                                  )}
                                  {product.status === 'suspended' && (
                                    <li>
                                      <button 
                                        onClick={() => updateProductStatus(product._id, 'active')}
                                        disabled={actionLoading}
                                      >
                                        <i className="fas fa-check text-success"></i>
                                        Activate
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <button 
                                      onClick={() => {
                                        setSelectedProduct(product);
                                        setShowReportModal(true);
                                      }}
                                    >
                                      <i className="fas fa-flag text-error"></i>
                                      Report Issue
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      onClick={() => deleteProduct(product._id)}
                                      disabled={actionLoading}
                                      className="text-error"
                                    >
                                      <i className="fas fa-trash"></i>
                                      Delete
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

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setShowProductModal(false)} 
        />
      )}

      {/* Report Modal */}
      {showReportModal && selectedProduct && (
        <ReportModal 
          product={selectedProduct} 
          onClose={() => setShowReportModal(false)}
          onSubmit={handleProductReport}
          loading={actionLoading}
        />
      )}
    </>
  );
};

// Product Details Modal Component
const ProductDetailsModal = ({ product, onClose }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Product Details: {product.name}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Product Images</h4>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <i className="fas fa-image text-4xl mb-2"></i>
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title text-base">Product Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Price:</strong> ${product.price?.toFixed(2)}</p>
                {product.comparePrice && (
                  <p><strong>Compare Price:</strong> ${product.comparePrice.toFixed(2)}</p>
                )}
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>SKU:</strong> {product.sku || 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={`badge ml-2 ${
                    product.status === 'active' ? 'badge-success' :
                    product.status === 'inactive' ? 'badge-warning' :
                    'badge-error'
                  }`}>
                    {product.status}
                  </span>
                </p>
                <p><strong>Category:</strong> {product.category?.name || 'Uncategorized'}</p>
                <p><strong>Vendor:</strong> {product.vendor?.businessName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Statistics */}
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h4 className="card-title text-base">Product Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {product.sales?.totalSold || 0}
                </div>
                <div className="text-sm text-secondary">Total Sold</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  ${product.sales?.totalRevenue?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-secondary">Total Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">
                  {product.ratings?.average?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-secondary">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {product.ratings?.count || 0}
                </div>
                <div className="text-sm text-secondary">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Product Variants</h4>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Value</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant, index) => (
                    <tr key={index}>
                      <td>{variant.option}</td>
                      <td>{variant.value}</td>
                      <td>${variant.price?.toFixed(2)}</td>
                      <td>{variant.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

// Report Modal Component
const ReportModal = ({ product, onClose, onSubmit, loading }) => {
  const [reportType, setReportType] = useState('quality');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    onSubmit(product._id, { reportType, description, severity });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Report Issue: {product.name}
          </h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Report Type</span>
            </label>
            <select 
              className="select select-bordered"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="quality">Quality Issue</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="copyright">Copyright Violation</option>
              <option value="fake">Fake/Counterfeit</option>
              <option value="pricing">Pricing Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Severity</span>
            </label>
            <select 
              className="select select-bordered"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
            ></textarea>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-error"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-flag mr-2"></i>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;
