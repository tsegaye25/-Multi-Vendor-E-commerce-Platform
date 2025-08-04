import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fab,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Inventory,
  TrendingUp,
  AttachMoney,
  ShoppingCart
} from '@mui/icons-material';

const VendorProducts = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    totalRevenue: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  // Fetch vendor products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await axios.get(`/api/vendors/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalProducts(response.data.totalProducts);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`/api/vendors/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'error' };
    if (stock <= 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  useEffect(() => {
    if (user && user.role === 'vendor') {
      fetchProducts();
    }
  }, [user, page, rowsPerPage, searchTerm, statusFilter]);

  if (!user || user.role !== 'vendor') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. This page is only available to vendors.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Products - MarketPlace</title>
        <meta name="description" content="Manage your products" />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Products
            </Typography>
            <Button
              component={Link}
              to="/vendor/products/add"
              variant="contained"
              startIcon={<Add />}
              size="large"
            >
              Add Product
            </Button>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Inventory color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TrendingUp color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Products
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: 'warning.main' }}>
                      <ShoppingCart sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Approval
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: 'error.main' }}>
                      <Inventory sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.suspended}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Suspended
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AttachMoney color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalRevenue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPage(0);
              }}
              variant="outlined"
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>
          </Stack>
        </Paper>

        {/* Products Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography>Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={2}>
                        <Inventory sx={{ fontSize: 64, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary">
                          No products found
                        </Typography>
                        <Button
                          component={Link}
                          to="/vendor/products/add"
                          variant="contained"
                          startIcon={<Add />}
                        >
                          Add Your First Product
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow key={product._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                              component="img"
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                            />
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.description?.substring(0, 50)}...
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {product.category?.name || 'Uncategorized'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            ${product.salePrice || product.price}
                          </Typography>
                          {product.salePrice && product.salePrice < product.price && (
                            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', display: 'block' }}>
                              ${product.price}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${product.stock} ${stockStatus.label}`}
                            color={stockStatus.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            color={getStatusColor(product.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              component={Link}
                              to={`/products/${product._id}`}
                              size="small"
                              title="View Product"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              component={Link}
                              to={`/vendor/products/edit/${product._id}`}
                              size="small"
                              title="Edit Product"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => setDeleteDialog({ open: true, product })}
                              size="small"
                              color="error"
                              title="Delete Product"
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalProducts}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, product: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteProduct(deleteDialog.product?._id)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Fab
          component={Link}
          to="/vendor/products/add"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <Add />
        </Fab>
      </Container>
    </>
  );
};

export default VendorProducts;
