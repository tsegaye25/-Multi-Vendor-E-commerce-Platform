import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  CloudUpload,
  Delete,
  Add,
  Info,
  CheckCircle,
  Error
} from '@mui/icons-material';

const steps = ['Basic Information', 'Images & Media', 'Pricing & Inventory', 'Review & Submit'];

const AddProduct = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);

  // Product form data
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    salePrice: '',
    stock: '',
    sku: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    images: [],
    variants: [],
    tags: [],
    status: 'draft', // draft, pending, active
    isActive: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    specifications: []
  });

  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/categories/brands')
        ]);
        
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
        
        if (brandsRes.data.success) {
          setBrands(brandsRes.data.brands);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories and brands');
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProductData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    const uploadedImages = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          uploadedImages.push({
            url: response.data.imageUrl,
            public_id: response.data.public_id,
            alt: productData.name || 'Product image'
          });
        }
      }

      setProductData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!productData.name.trim()) newErrors.name = 'Product name is required';
    if (!productData.description.trim()) newErrors.description = 'Description is required';
    if (!productData.category) newErrors.category = 'Category is required';
    if (!productData.price || productData.price <= 0) newErrors.price = 'Valid price is required';
    if (!productData.stock || productData.stock < 0) newErrors.stock = 'Valid stock quantity is required';

    // Sale price validation
    if (productData.salePrice && parseFloat(productData.salePrice) >= parseFloat(productData.price)) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    // Image validation
    if (productData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...productData,
        status,
        price: parseFloat(productData.price),
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : undefined,
        stock: parseInt(productData.stock),
        weight: productData.weight ? parseFloat(productData.weight) : undefined
      };

      const response = await axios.post('/api/vendors/products', submitData);

      if (response.data.success) {
        toast.success(
          status === 'draft' 
            ? 'Product saved as draft successfully'
            : 'Product submitted for approval successfully'
        );
        navigate('/vendor/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info
      const basicErrors = {};
      if (!productData.name.trim()) basicErrors.name = 'Product name is required';
      if (!productData.description.trim()) basicErrors.description = 'Description is required';
      if (!productData.category) basicErrors.category = 'Category is required';
      
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validate images
      if (productData.images.length === 0) {
        setErrors({ images: 'At least one product image is required' });
        toast.error('Please upload at least one product image');
        return;
      }
    }

    if (activeStep === 2) {
      // Validate pricing
      const pricingErrors = {};
      if (!productData.price || productData.price <= 0) pricingErrors.price = 'Valid price is required';
      if (!productData.stock || productData.stock < 0) pricingErrors.stock = 'Valid stock quantity is required';
      
      if (Object.keys(pricingErrors).length > 0) {
        setErrors(pricingErrors);
        toast.error('Please fix pricing and inventory errors');
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

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
        <title>Add Product - Vendor Dashboard</title>
        <meta name="description" content="Add a new product to your store" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <IconButton onClick={() => navigate('/vendor/products')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Add New Product
            </Typography>
          </Stack>
          
          <Typography variant="body1" color="text.secondary">
            Create a new product listing for your store. Fill in all the required information to get started.
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              {/* Step 0: Basic Information */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Basic Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        placeholder="Enter product name"
                        value={productData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Description"
                        placeholder="Describe your product in detail"
                        multiline
                        rows={4}
                        value={productData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        error={!!errors.description}
                        helperText={errors.description}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.category} required>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={productData.category}
                          label="Category"
                          onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.category && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                            {errors.category}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Brand</InputLabel>
                        <Select
                          value={productData.brand}
                          label="Brand"
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                        >
                          <MenuItem value="">
                            <em>No Brand</em>
                          </MenuItem>
                          {brands.map((brand) => (
                            <MenuItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SKU (Optional)"
                        placeholder="Product SKU"
                        value={productData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Weight (kg)"
                        type="number"
                        placeholder="0.0"
                        value={productData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 1: Images & Media */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Images & Media
                  </Typography>
                  
                  {/* Image Upload */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Product Images
                    </Typography>
                    
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: errors.images ? 'error.main' : 'grey.300',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                      />
                      
                      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Drop images here or click to upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports: JPG, PNG, WebP (Max 5MB each)
                      </Typography>
                      
                      {uploadingImages && (
                        <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                          Uploading images...
                        </Typography>
                      )}
                    </Paper>
                    
                    {errors.images && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.images}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Image Preview */}
                  {productData.images.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Uploaded Images ({productData.images.length})
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {productData.images.map((image, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Card>
                              <Box sx={{ position: 'relative' }}>
                                <Box
                                  component="img"
                                  src={image.url}
                                  alt={`Product ${index + 1}`}
                                  sx={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover'
                                  }}
                                />
                                <IconButton
                                  onClick={() => handleRemoveImage(index)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'rgba(0,0,0,0.9)'
                                    }
                                  }}
                                  size="small"
                                >
                                  <Delete />
                                </IconButton>
                                {index === 0 && (
                                  <Chip
                                    label="Main"
                                    color="primary"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      bottom: 4,
                                      left: 4
                                    }}
                                  />
                                )}
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 2: Pricing & Inventory */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Pricing & Inventory
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Regular Price"
                        type="number"
                        placeholder="0.00"
                        value={productData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        error={!!errors.price}
                        helperText={errors.price}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        inputProps={{ step: 0.01, min: 0 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sale Price (Optional)"
                        type="number"
                        placeholder="0.00"
                        value={productData.salePrice}
                        onChange={(e) => handleInputChange('salePrice', e.target.value)}
                        error={!!errors.salePrice}
                        helperText={errors.salePrice}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        placeholder="0"
                        value={productData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        error={!!errors.stock}
                        helperText={errors.stock}
                        inputProps={{ min: 0 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={productData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          />
                        }
                        label="Active Product"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Dimensions (Optional)
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Length (cm)"
                        type="number"
                        value={productData.dimensions.length}
                        onChange={(e) => handleInputChange('dimensions.length', e.target.value)}
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Width (cm)"
                        type="number"
                        value={productData.dimensions.width}
                        onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Height (cm)"
                        type="number"
                        value={productData.dimensions.height}
                        onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                        inputProps={{ step: 0.1, min: 0 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 3: Review & Submit */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Review & Submit
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Please review all the information before submitting. Once submitted, your product will be reviewed by our team before going live.
                    </Typography>
                  </Alert>
                  
                  {/* Product Preview */}
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          {productData.images.length > 0 && (
                            <Box
                              component="img"
                              src={productData.images[0].url}
                              alt={productData.name}
                              sx={{
                                width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            {productData.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {productData.description}
                          </Typography>
                          
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ${productData.salePrice || productData.price}
                            </Typography>
                            {productData.salePrice && (
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                ${productData.price}
                              </Typography>
                            )}
                          </Stack>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`Stock: ${productData.stock}`} size="small" />
                            <Chip label={categories.find(c => c._id === productData.category)?.name || 'Category'} size="small" />
                            {productData.brand && (
                              <Chip label={brands.find(b => b._id === productData.brand)?.name || 'Brand'} size="small" />
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    By submitting this product, you agree to our terms and conditions. Your product will be reviewed and approved before appearing on the marketplace.
                  </Typography>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Stack direction="row" spacing={2}>
                  {activeStep === steps.length - 1 ? (
                    <>
                      <Button
                        onClick={() => handleSubmit('draft')}
                        disabled={loading}
                        variant="outlined"
                        startIcon={<Save />}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit('pending')}
                        disabled={loading}
                        variant="contained"
                        startIcon={<CheckCircle />}
                      >
                        Submit for Approval
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                    >
                      Next
                    </Button>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Tips Card */}
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Info color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Tips for Success
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      • Use high-quality images with good lighting
                    </Typography>
                    <Typography variant="body2">
                      • Write detailed, accurate descriptions
                    </Typography>
                    <Typography variant="body2">
                      • Set competitive pricing
                    </Typography>
                    <Typography variant="body2">
                      • Choose the right category and tags
                    </Typography>
                    <Typography variant="body2">
                      • Keep inventory levels updated
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Preview Button */}
              <Button
                onClick={() => setPreviewDialog(true)}
                variant="outlined"
                startIcon={<Preview />}
                fullWidth
              >
                Preview Product
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialog}
          onClose={() => setPreviewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Product Preview</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This is how your product will appear to customers:
            </Typography>
            
            {/* Product preview content would go here */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{productData.name || 'Product Name'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {productData.description || 'Product description...'}
                </Typography>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AddProduct;
