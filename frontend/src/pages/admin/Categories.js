import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    isActive: true
  });

  // Brand form state
  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory._id}`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/admin/categories', categoryForm);
        toast.success('Category created successfully');
      }
      
      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      if (editingBrand) {
        await axios.put(`/api/admin/brands/${editingBrand._id}`, brandForm);
        toast.success('Brand updated successfully');
      } else {
        await axios.post('/api/admin/brands', brandForm);
        toast.success('Brand created successfully');
      }
      
      setShowBrandModal(false);
      resetBrandForm();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.message || 'Failed to save brand');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await axios.delete(`/api/admin/categories/${categoryId}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const deleteBrand = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await axios.delete(`/api/admin/brands/${brandId}`);
        toast.success('Brand deleted successfully');
        fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        toast.error(error.response?.data?.message || 'Failed to delete brand');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        parentCategory: category.parentCategory || '',
        isActive: category.isActive
      });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const openBrandModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        isActive: brand.isActive
      });
    } else {
      setEditingBrand(null);
      resetBrandForm();
    }
    setShowBrandModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: '',
      parentCategory: '',
      isActive: true
    });
    setEditingCategory(null);
  };

  const resetBrandForm = () => {
    setBrandForm({
      name: '',
      description: '',
      logo: '',
      website: '',
      isActive: true
    });
    setEditingBrand(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories and brands..." />;
  }

  return (
    <>
      <Helmet>
        <title>Categories & Brands - MarketPlace</title>
        <meta name="description" content="Manage product categories and brands" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Categories & Brands</h1>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === 'categories' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <i className="fas fa-tags mr-2"></i>
              Categories ({categories.length})
            </button>
            <button 
              className={`tab ${activeTab === 'brands' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('brands')}
            >
              <i className="fas fa-trademark mr-2"></i>
              Brands ({brands.length})
            </button>
          </div>

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Product Categories</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => openCategoryModal()}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category._id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="card-title text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-secondary mt-1">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`badge ${category.isActive ? 'badge-success' : 'badge-error'}`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {category.parentCategory && (
                              <span className="badge badge-outline">
                                Subcategory
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-secondary mt-2">
                            Products: {category.productCount || 0}
                          </div>
                        </div>
                        {category.image && (
                          <div className="avatar">
                            <div className="w-12 h-12 rounded">
                              <img src={category.image} alt={category.name} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openCategoryModal(category)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => deleteCategory(category._id)}
                          disabled={actionLoading}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-tags text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
                  <p className="text-secondary mb-4">Start by creating your first product category.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => openCategoryModal()}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Category
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === 'brands' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Product Brands</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => openBrandModal()}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Brand
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => (
                  <div key={brand._id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="card-title text-lg">{brand.name}</h3>
                          {brand.description && (
                            <p className="text-sm text-secondary mt-1">
                              {brand.description}
                            </p>
                          )}
                          {brand.website && (
                            <a 
                              href={brand.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="link link-primary text-sm mt-1 block"
                            >
                              <i className="fas fa-external-link-alt mr-1"></i>
                              Website
                            </a>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`badge ${brand.isActive ? 'badge-success' : 'badge-error'}`}>
                              {brand.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-secondary mt-2">
                            Products: {brand.productCount || 0}
                          </div>
                        </div>
                        {brand.logo && (
                          <div className="avatar">
                            <div className="w-12 h-12 rounded">
                              <img src={brand.logo} alt={brand.name} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => openBrandModal(brand)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => deleteBrand(brand._id)}
                          disabled={actionLoading}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {brands.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-trademark text-4xl text-secondary mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">No Brands Found</h3>
                  <p className="text-secondary mb-4">Start by creating your first product brand.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => openBrandModal()}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Brand
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                className="btn btn-sm btn-circle" 
                onClick={() => setShowCategoryModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Category Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Image URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Parent Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={categoryForm.parentCategory}
                  onChange={(e) => setCategoryForm({...categoryForm, parentCategory: e.target.value})}
                >
                  <option value="">None (Main Category)</option>
                  {categories
                    .filter(cat => cat._id !== editingCategory?._id)
                    .map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-control mb-6">
                <label className="label cursor-pointer">
                  <span className="label-text">Active</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({...categoryForm, isActive: e.target.checked})}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button 
                className="btn btn-sm btn-circle" 
                onClick={() => setShowBrandModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBrandSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Brand Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({...brandForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Logo URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={brandForm.logo}
                  onChange={(e) => setBrandForm({...brandForm, logo: e.target.value})}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Website URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={brandForm.website}
                  onChange={(e) => setBrandForm({...brandForm, website: e.target.value})}
                />
              </div>

              <div className="form-control mb-6">
                <label className="label cursor-pointer">
                  <span className="label-text">Active</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={brandForm.isActive}
                    onChange={(e) => setBrandForm({...brandForm, isActive: e.target.checked})}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowBrandModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingBrand ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCategories;
