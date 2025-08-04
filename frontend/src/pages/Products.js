import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stack,
  Badge,
  CardActions
} from '@mui/material';
import {
  Search,
  FilterList,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Visibility,
  Clear,
  Store
} from '@mui/icons-material';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  
  const productsPerPage = 12;

  // Fetch products from API
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      // Only add non-empty parameters
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (priceRange.min && priceRange.min > 0) params.set('minPrice', priceRange.min);
      if (priceRange.max && priceRange.max > 0) params.set('maxPrice', priceRange.max);
      if (sortBy) params.set('sort', sortBy);
      if (inStock) params.set('inStock', 'true');

      const response = await axios.get(`/api/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalProducts(response.data.totalProducts);
        
        // Update URL params
        const newSearchParams = new URLSearchParams();
        if (searchTerm) newSearchParams.set('search', searchTerm);
        if (selectedCategory) newSearchParams.set('category', selectedCategory);
        if (selectedBrand) newSearchParams.set('brand', selectedBrand);
        if (priceRange.min) newSearchParams.set('minPrice', priceRange.min);
        if (priceRange.max) newSearchParams.set('maxPrice', priceRange.max);
        if (sortBy !== 'newest') newSearchParams.set('sort', sortBy);
        if (inStock) newSearchParams.set('inStock', 'true');
        if (page > 1) newSearchParams.set('page', page.toString());
        
        setSearchParams(newSearchParams);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and brands
  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/brands')
      ]);
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.categories);
      }
      
      if (brandsRes.data.success) {
        setBrands(brandsRes.data.brands);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      // For now, we'll use a simple API call to add to cart
      // This can be replaced with CartContext once the context issue is resolved
      await axios.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
      });
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add product to cart');
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await axios.post('/api/users/wishlist', { productId });
      toast.success('Product added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setInStock(false);
    setCurrentPage(1);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1);
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, sortBy]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', class: 'badge-error' };
    if (stock <= 10) return { text: 'Low Stock', class: 'badge-warning' };
    return { text: 'In Stock', class: 'badge-success' };
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300"></i>);
    }
    
    return stars;
  };

  return (
    <>
      <Helmet>
        <title>Products - MarketPlace</title>
        <meta name="description" content="Browse all products on MarketPlace" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary">
                  Products
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {totalProducts} products found
                </Typography>
              </Box>
              
              {/* Sort Options */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Container>
        </Paper>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Filters Sidebar */}
            <Grid item xs={12} lg={3}>
              <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 16 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Filters
                  </Typography>
                  <Button
                    onClick={clearFilters}
                    size="small"
                    startIcon={<Clear />}
                    variant="outlined"
                  >
                    Clear All
                  </Button>
                </Stack>

                {/* Search */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Search Products
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                      InputProps={{
                        startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
                      }}
                    />
                    <Button
                      onClick={applyFilters}
                      variant="contained"
                      size="small"
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <Search />
                    </Button>
                  </Stack>
                </Box>

                {/* Category Filter */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Category
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>All Categories</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="All Categories"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Brand Filter */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Brand
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>All Brands</InputLabel>
                    <Select
                      value={selectedBrand}
                      label="All Brands"
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      <MenuItem value="">All Brands</MenuItem>
                      {brands.map((brand) => (
                        <MenuItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Price Range */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Price Range
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                </Box>

                {/* Stock Filter */}
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="In Stock Only"
                  />
                </Box>

                <Button
                  onClick={applyFilters}
                  variant="contained"
                  fullWidth
                  size="large"
                >
                  Apply Filters
                </Button>
              </Paper>
            </Grid>

            {/* Products Grid */}
            <Grid item xs={12} lg={9}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                  <CircularProgress size={60} />
                </Box>
              ) : products.length === 0 ? (
                <Paper elevation={1} sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🛍️</Typography>
                  <Typography variant="h5" component="h3" fontWeight="bold" sx={{ mb: 1 }}>
                    No products found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your filters or search terms
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {products.map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            {product.discount > 0 && (
                              <Chip
                                label={`-${product.discount}%`}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                              />
                            )}
                            {product.stock <= 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px 4px 0 0'
                                }}
                              >
                                <Typography variant="h6" color="white" fontWeight="bold">
                                  Out of Stock
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 1 }}>
                              <Link
                                to={`/products/${product._id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                {product.name}
                              </Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {product.description}
                            </Typography>
                            {/* Rating */}
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                              <Rating value={product.averageRating || 0} precision={0.5} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">
                                ({product.reviewCount || 0})
                              </Typography>
                            </Stack>
                            {/* Price */}
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                              <Typography variant="h6" color="primary" fontWeight="bold">
                                ${product.salePrice || product.price}
                              </Typography>
                              {product.salePrice && product.salePrice < product.price && (
                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                  ${product.price}
                                </Typography>
                              )}
                            </Stack>
                            {/* Vendor */}
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                              <Store sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              by {product.vendor?.businessName || 'Unknown Vendor'}
                            </Typography>
                            {/* Stock Status */}
                            <Chip 
                              label={product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                              color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                              size="small"
                              sx={{ alignSelf: 'flex-start', mb: 2 }}
                            />
                          </CardContent>
                          {/* Actions */}
                          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                            <IconButton
                              onClick={() => handleAddToWishlist(product._id)}
                              color="primary"
                              size="small"
                            >
                              <FavoriteBorder />
                            </IconButton>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              variant="contained"
                              size="small"
                              startIcon={<ShoppingCart />}
                            >
                              Add to Cart
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        color="primary"
                        size="large"
                      />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Products;
