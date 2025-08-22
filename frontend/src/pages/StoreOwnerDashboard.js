import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Box, Container, Typography, Button, Grid, Paper, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Alert, CircularProgress
} from '@mui/material';

// --- Change Password Form ---
const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put('http://localhost:5001/api/users/password', formData, config);
      setIsError(false);
      setMessage(res.data.msg);
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setIsError(true);
      const errorMsg = error.response.data.errors ? error.response.data.errors[0].msg : error.response.data.msg;
      setMessage(errorMsg || 'An error occurred.');
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>Change Your Password</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={onChange} required size="small" />
        <TextField label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={onChange} required size="small" />
        <Button type="submit" variant="contained">Update</Button>
      </Box>
      {message && <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
    </Paper>
  );
};

// --- Main StoreOwnerDashboard Component ---
const StoreOwnerDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5001/api/owner/dashboard', config);
        setDashboardData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">Store Owner Dashboard</Typography>
          <Button variant="outlined" onClick={logout}>Logout</Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : dashboardData && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Your Store's Average Rating</Typography>
                <Typography variant="h3" component="p" sx={{ color: 'primary.main', mt: 1 }}>
                  {dashboardData.averageRating 
                    ? `${parseFloat(dashboardData.averageRating).toFixed(2)} / 5.0`
                    : 'Not Rated Yet'
                  }
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>Users Who Rated Your Store</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User Name</TableCell>
                      <TableCell>User Email</TableCell>
                      <TableCell align="right">Rating Given</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.raters && dashboardData.raters.length > 0 ? (
                      dashboardData.raters.map((rater, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{rater.name}</TableCell>
                          <TableCell>{rater.email}</TableCell>
                          <TableCell align="right">{rater.rating} ★</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No ratings have been submitted for your store yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
        <ChangePasswordForm />
      </Paper>
    </Container>
  );
};

export default StoreOwnerDashboard;