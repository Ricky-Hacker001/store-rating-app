import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'store_owner') navigate('/owner/dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const loginUrl = 'http://localhost:5001/api/auth/login';
      const response = await axios.post(loginUrl, formData);
      setIsError(false);
      setMessage('Login successful! Redirecting...');
      login(response.data.token);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={onChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={onChange}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Login
      </Button>

      {message && (
        <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {"Don't have an account? "}
        <MuiLink component={RouterLink} to="/signup" variant="body2">
          {"Sign Up"}
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default LoginForm;