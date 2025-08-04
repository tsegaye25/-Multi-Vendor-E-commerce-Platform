import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  Analytics as AnalyticsIcon,
  Store as StoreIcon,
  Add as AddIcon,
  TrendingUp,
  AttachMoney,
  Visibility,
  Edit
} from '@mui/icons-material';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch vendor stats and recent products
      const [statsResponse, productsResponse] = await Promise.all([
        axios.get('/api/vendors/dashboard/stats'),
        axios.get('/api/vendors/products?limit=5&sort=-createdAt')
      ]);
      
      setStats(statsResponse.data.stats);
      setRecentProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'vendor') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page is only available to vendors.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vendor Dashboard - MarketPlace</title>
        <meta name="description" content="Manage your vendor account and products" />
      </Helmet>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Vendor Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {user?.name || 'Vendor'}!
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Total Products
                        </Typography>
                        <Typography variant="h4">
                          {stats?.totalProducts || 0}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ProductsIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Active Products
                        </Typography>
                        <Typography variant="h4">
                          {stats?.activeProducts || 0}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Visibility />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Total Orders
                        </Typography>
                        <Typography variant="h4">
                          {stats?.totalOrders || 0}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <OrdersIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4">
                          ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <AttachMoney />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        component={Link}
                        to="/vendor/products/add"
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        sx={{ py: 2 }}
                      >
                        Add Product
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        component={Link}
                        to="/vendor/products"
                        variant="outlined"
                        fullWidth
                        startIcon={<ProductsIcon />}
                        sx={{ py: 2 }}
                      >
                        Manage Products
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        component={Link}
                        to="/vendor/orders"
                        variant="outlined"
                        fullWidth
                        startIcon={<OrdersIcon />}
                        sx={{ py: 2 }}
                      >
                        View Orders
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<StoreIcon />}
                        sx={{ py: 2 }}
                        onClick={() => toast.info('Store customization coming soon!')}
                      >
                        Customize Store
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Products */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">
                      Recent Products
                    </Typography>
                    <Button
                      component={Link}
                      to="/vendor/products"
                      size="small"
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {recentProducts.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <ProductsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No products yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Start by adding your first product to get started.
                      </Typography>
                      <Button
                        component={Link}
                        to="/vendor/products/add"
                        variant="contained"
                        startIcon={<AddIcon />}
                      >
                        Add Your First Product
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      {recentProducts.map((product) => (
                        <Box key={product._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={2}>
                              {product.images?.[0] && (
                                <Avatar
                                  src={`${axios.defaults.baseURL}/${product.images[0]}`}
                                  variant="rounded"
                                  sx={{ width: 56, height: 56 }}
                                />
                              )}
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ${product.price} • Stock: {product.stock}
                                </Typography>
                                <Chip
                                  label={product.status}
                                  size="small"
                                  color={product.status === 'active' ? 'success' : 'default'}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Box>
                            <IconButton
                              component={Link}
                              to={`/vendor/products/edit/${product._id}`}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Performance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="success" />
                      <Typography variant="subtitle1">
                        Sales This Month
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      ${stats?.monthlyRevenue?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Top Performing Product
                    </Typography>
                    <Typography variant="subtitle1">
                      {stats?.topProduct?.name || 'No sales yet'}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AnalyticsIcon />}
                    onClick={() => toast.info('Detailed analytics coming soon!')}
                  >
                    View Analytics
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default VendorDashboard;
