import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  Google,
  Facebook,
  Store,
  ShoppingBag
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>Welcome Back - MarketPlace</title>
        <meta name="description" content="Login to your MarketPlace account - Your gateway to amazing products" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc' }}>
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
            
            {/* Left Side - Welcome Section */}
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
                <Box sx={{ textAlign: 'left', zIndex: 1, width: '100%', maxWidth: 400 }}>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 4,
                      fontSize: { xs: '2rem', md: '3rem' },
                      lineHeight: 1.2,
                      textAlign: 'left'
                    }}
                  >
                    Simplify
                    <br />
                    management with
                    <br />
                    our dashboard.
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        width: '120px',
                        height: '4px',
                        backgroundColor: 'white',
                        mt: 1,
                        borderRadius: '2px'
                      }}
                    />
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 6, 
                      opacity: 0.9, 
                      lineHeight: 1.6,
                      fontSize: '1.1rem',
                      textAlign: 'left'
                    }}
                  >
                    Simplify your e-commerce management with our
                    <br />
                    user-friendly admin dashboard.
                  </Typography>
                  
                  {/* Illustration Area - Placeholder for characters */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'flex-end',
                      mt: 4,
                      height: '200px',
                      position: 'relative'
                    }}
                  >
                    {/* Male Character Placeholder */}
                    <Box
                      sx={{
                        width: '80px',
                        height: '120px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '40px 40px 20px 20px',
                        mr: 2,
                        position: 'relative',
                        '&::before': {
                          content: '"👨‍💼"',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '3rem'
                        }
                      }}
                    />
                    
                    {/* Female Character Placeholder */}
                    <Box
                      sx={{
                        width: '80px',
                        height: '120px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '40px 40px 20px 20px',
                        position: 'relative',
                        '&::before': {
                          content: '"👩‍💼"',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '3rem'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Side - Login Form */}
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
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '400px', md: '400px' }, mx: 'auto' }}>
                  
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
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                      Please login to your account
                    </Typography>
                  </Box>

                  {/* Error Alert */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Login Form */}
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
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

                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
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
                        mb: 2,
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

                    {/* Forgot Password Link */}
                    <Box sx={{ textAlign: 'right', mb: 3 }}>
                      <Link 
                        to="/forgot-password" 
                        style={{ 
                          color: '#ff7a45', 
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{
                        py: 1.8,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff7a45 0%, #ff9500 100%)',
                        boxShadow: '0 4px 15px 0 rgba(255, 122, 69, 0.4)',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        mb: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8500 100%)',
                          boxShadow: '0 6px 20px 0 rgba(255, 122, 69, 0.6)',
                        },
                        '&:disabled': {
                          background: '#e2e8f0',
                          color: '#64748b'
                        }
                      }}
                    >
                      {loading ? 'Signing In...' : 'Login'}
                    </Button>

                    {/* Social Login Divider */}
                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Or login with
                      </Typography>
                    </Divider>

                    {/* Social Login Buttons */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Google />}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              bgcolor: '#f8fafc'
                            }
                          }}
                        >
                          Google
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Facebook />}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              bgcolor: '#f8fafc'
                            }
                          }}
                        >
                          Facebook
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Sign Up Link */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link 
                          to="/register" 
                          style={{ 
                            color: '#ff7a45', 
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          Signup
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Login;
