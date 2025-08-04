import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Phone,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Google,
  Facebook
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - MarketPlace</title>
        <meta name="description" content="Create your MarketPlace account" />
      </Helmet>

      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 1, sm: 2, md: 0 }
        }}
      >
        <Grid 
          container 
          sx={{ 
            minHeight: { xs: 'auto', md: '90vh' },
            maxWidth: '1400px',
            width: '100%',
            boxShadow: { xs: 'none', md: '0 20px 60px rgba(0,0,0,0.1)' },
            borderRadius: { xs: 0, md: '24px' },
            overflow: 'hidden'
          }}
        >
          
          {/* Left Side - Orange Gradient Section */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                height: { xs: '300px', sm: '400px', md: '100%' },
                minHeight: { md: '600px' },
                background: 'linear-gradient(135deg, #ff7a45 0%, #ff9500 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 3, sm: 4, md: 6 },
                color: 'white',
                borderRadius: { xs: '24px 24px 0 0', md: '24px 0 0 24px' },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
              
              <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: 400 }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Join our community
                </Typography>
                
                {/* Decorative underline */}
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 4, 
                    backgroundColor: 'white', 
                    mx: 'auto', 
                    mb: 3,
                    borderRadius: 2
                  }} 
                />
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.95,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  Start your e-commerce journey with thousands of vendors and customers worldwide
                </Typography>
                
                {/* Character Illustrations Placeholder */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ fontSize: '4rem' }}>👥</Box>
                  <Box sx={{ fontSize: '4rem' }}>🛒</Box>
                  <Box sx={{ fontSize: '4rem' }}>🌟</Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Signup Form */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              height: '100%', 
              minHeight: { xs: 'auto', md: '600px' },
              display: 'flex', 
              alignItems: 'center', 
              p: { xs: 3, sm: 4, md: 6 }, 
              bgcolor: 'white', 
              borderRadius: { xs: '0 0 24px 24px', md: '0 24px 24px 0' }
            }}>
              <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '450px', md: '500px' }, mx: 'auto' }}>
                
                {/* Brand Logo */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#ff7a45',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      E
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      MarketPlace
                    </Typography>
                  </Box>
                </Box>
                
                {/* Header */}
                <Box sx={{ textAlign: 'left', mb: 4 }}>
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1e293b',
                      fontSize: '2.5rem',
                      mb: 1
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    Join MarketPlace and start your journey
                  </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                {/* Signup Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: '#ff7a45',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ff7a45',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: '#ff7a45',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ff7a45',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Email Field */}
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#ff7a45',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff7a45',
                        },
                      },
                    }}
                  />

                  {/* Phone Field */}
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number (Optional)"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#ff7a45',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff7a45',
                        },
                      },
                    }}
                  />

                  {/* Account Type Select */}
                  <TextField
                    fullWidth
                    select
                    id="role"
                    name="role"
                    label="Account Type"
                    value={formData.role}
                    onChange={handleChange}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: '#ff7a45',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff7a45',
                        },
                      },
                    }}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                  </TextField>

                  {/* Password Fields */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter password"
                        inputProps={{ minLength: 6 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: '#ff7a45',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ff7a45',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm password"
                        inputProps={{ minLength: 6 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: '#ff7a45',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ff7a45',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Create Account Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? null : <PersonAdd />}
                    sx={{
                      mt: 2,
                      mb: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ff7a45 0%, #ff9500 100%)',
                      boxShadow: '0 4px 15px rgba(255, 122, 69, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8500 100%)',
                        boxShadow: '0 6px 20px rgba(255, 122, 69, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#ccc'
                      }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  {/* Divider */}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Or continue with
                    </Typography>
                  </Divider>

                  {/* Social Login Buttons */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        sx={{
                          py: 1.2,
                          borderRadius: '12px',
                          borderColor: '#ddd',
                          color: '#666',
                          '&:hover': {
                            borderColor: '#ff7a45',
                            backgroundColor: 'rgba(255, 122, 69, 0.05)'
                          }
                        }}
                      >
                        Google
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Facebook />}
                        sx={{
                          py: 1.2,
                          borderRadius: '12px',
                          borderColor: '#ddd',
                          color: '#666',
                          '&:hover': {
                            borderColor: '#ff7a45',
                            backgroundColor: 'rgba(255, 122, 69, 0.05)'
                          }
                        }}
                      >
                        Facebook
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        style={{ 
                          color: '#ff7a45', 
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        Sign in here
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Register;
