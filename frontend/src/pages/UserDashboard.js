import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Box, Container, Typography, Button, Grid, Paper, Divider,
  TextField, Alert, CircularProgress, Card, CardContent, CardActions,
  Tabs, Tab, CardActionArea, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// --- Tab Panel Helper Component ---
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
    <Paper sx={{ p: 2, maxWidth: 700 }}>
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

// --- Star Rating Component ---
const StarRating = ({ storeId, userRating, onRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <Box>
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <Typography
            component="span"
            key={index}
            sx={{ 
              cursor: 'pointer',
              fontSize: '2rem', 
              color: ratingValue <= (hover || userRating) ? 'warning.main' : 'grey.300'
            }}
            onClick={() => onRating(storeId, ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            &#9733;
          </Typography>
        );
      })}
    </Box>
  );
};

// --- Store Detail Dialog Component ---
const StoreDetailDialog = ({ store, open, onClose }) => {
  if (!store) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {store.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          <strong>Address:</strong> {store.address}
        </Typography>
        <Typography gutterBottom>
          <strong>Email:</strong> {store.email}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Overall Rating: {store.averageRating ? `${parseFloat(store.averageRating).toFixed(1)} / 5.0` : 'Not Rated Yet'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};


// --- Main UserDashboard Component ---
const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'x-auth-token': token },
        params: { search: searchTerm }
      };
      const res = await axios.get('http://localhost:5001/api/stores', config);
      setStores(res.data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRating = async (storeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`http://localhost:5001/api/stores/${storeId}/ratings`, { rating }, config);
      fetchStores(); 
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <StoreDetailDialog store={selectedStore} open={!!selectedStore} onClose={() => setSelectedStore(null)} />

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">Welcome, {user?.name || user?.role}</Typography>
          <Button variant="outlined" onClick={logout}>Logout</Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="user dashboard tabs">
            <Tab label="Stores" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          <Box sx={{ my: 2 }}>
            <TextField 
              fullWidth
              variant="outlined"
              label="Search by store name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Grid container spacing={3}>
            {stores.length > 0 ? (
              stores.map(store => (
                <Grid item key={store.id} xs={12} sm={6} md={4}>
                  <Card sx={{ height: 350, display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => setSelectedStore(store)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <CardContent sx={{ width: '100%' }}>
                        <Typography gutterBottom variant="h5" component="h2" noWrap title={store.name}>
                          {store.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          title={store.address}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            height: 40,
                          }}
                        >
                          {store.address}
                        </Typography>
                        <Divider sx={{ my: 2 }}/>
                        <Typography variant="body1">
                          <strong>Overall Rating:</strong> {store.averageRating ? parseFloat(store.averageRating).toFixed(1) : 'Not Rated'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, pt: 1 }}>
                      <Typography variant="subtitle1">Your Rating</Typography>
                      <StarRating storeId={store.id} userRating={store.userRating} onRating={handleRating} />
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center" sx={{ mt: 4 }}>No stores found.</Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Typography variant="h5" gutterBottom>Account Settings</Typography>
          <ChangePasswordForm />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default UserDashboard;