import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../api/client';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (authError) setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const data = await apiLogin(form.email.trim(), form.password);
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user_name', data.user.name);
      sessionStorage.setItem('user_team', data.user.team ?? '');
      sessionStorage.setItem('is_admin', data.user.is_admin ? '1' : '0');
      sessionStorage.setItem('has_submitted', data.user.has_submitted ? '1' : '0');
      navigate('/placement');
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, #1a237e 0%, #0d47a1 40%, #1565c0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          top: -150,
          right: -150,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          bottom: 100,
          left: -80,
        }}
      />

      {/* Header bar */}
      <Box
        sx={{
          px: 4,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <RateReviewIcon sx={{ color: '#fff', fontSize: 26 }} />
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.5px',
            fontSize: '1rem',
          }}
        >
          Anonymous Rating Form
        </Typography>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Title block */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <RateReviewIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{ color: '#fff', mb: 0.5, fontSize: '1.75rem' }}
            >
              Welcome Back
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>
              Sign in to submit your anonymous ratings
            </Typography>
          </Box>

          {/* Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255,255,255,0.97)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary', fontSize: '1.25rem' }}>
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Enter your credentials to continue
              </Typography>

              {authError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {authError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, fontSize: '0.9375rem' }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: '#f8f9ff',
                  border: '1px solid #e8eaf6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#3949ab', fontWeight: 600, fontSize: '0.775rem', lineHeight: 1.5 }}
                >
                  Use your IBM email address and the password provided by your administrator.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', textAlign: 'center', mt: 3 }}
          >
            © 2025 Anonymous Rating Form. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
