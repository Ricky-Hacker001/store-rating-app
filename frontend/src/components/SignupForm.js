import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const { name, email, password, address } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const registerUrl = 'http://localhost:5001/api/auth/register';
      const response = await axios.post(registerUrl, formData);
      setIsError(false);
      setMessage(response.data.message);
    } catch (error) {
      setIsError(true);
      // Handle validation errors from express-validator
      const errorMsg = error.response.data.errors 
        ? error.response.data.errors[0].msg 
        : error.response.data.message;
      setMessage(errorMsg || 'An error occurred.');
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={onChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
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
        autoComplete="new-password"
        value={password}
        onChange={onChange}
      />
      <TextField
        margin="normal"
        fullWidth
        name="address"
        label="Address"
        id="address"
        autoComplete="street-address"
        multiline
        rows={3}
        value={address}
        onChange={onChange}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign Up
      </Button>

      {message && (
        <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {'Already have an account? '}
        <MuiLink component={RouterLink} to="/login" variant="body2">
          {"Log In"}
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default SignupForm;