import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Box, Container, Typography, Button, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Tabs, Tab, Toolbar, IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

// --- Tab Panel Helper Component ---
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// --- Edit User Dialog ---
const EditUserDialog = ({ user, open, onClose, onUserUpdated, token }) => {
  const [formData, setFormData] = useState(user);
  useEffect(() => setFormData(user), [user]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.put(`http://localhost:5001/api/admin/users/${user.id}`, formData, config);
      onUserUpdated();
      onClose();
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to update user.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User: {user.name}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Full Name" type="text" fullWidth variant="outlined" value={formData.name} onChange={onChange} required />
          <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="outlined" value={formData.email} onChange={onChange} required />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="outlined" value={formData.address} onChange={onChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} label="Role" onChange={onChange}>
              <MenuItem value="user">User</MenuItem><MenuItem value="admin">Admin</MenuItem><MenuItem value="store_owner" disabled>Store Owner</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Changes</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// --- Edit Store Dialog ---
const EditStoreDialog = ({ store, open, onClose, onStoreUpdated, token, storeOwners }) => {
  const [formData, setFormData] = useState(store);
  useEffect(() => setFormData(store), [store]);
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.put(`http://localhost:5001/api/admin/stores/${store.id}`, formData, config);
      onStoreUpdated();
      onClose();
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to update store.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Store: {store.name}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Store Name" type="text" fullWidth variant="outlined" value={formData.name} onChange={onChange} required />
          <TextField margin="dense" name="email" label="Store Email" type="email" fullWidth variant="outlined" value={formData.email} onChange={onChange} required />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="outlined" value={formData.address} onChange={onChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Owner</InputLabel>
            <Select name="owner_id" value={formData.owner_id || ''} label="Owner" onChange={onChange}>
              <MenuItem value="">-- No Owner --</MenuItem>
              {storeOwners.map(owner => <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Changes</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// --- Add User Dialog ---
const AddUserDialog = ({ open, onClose, onUserAdded, token }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('http://localhost:5001/api/admin/users', formData, config);
      onUserAdded();
      onClose();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.msg || 'Failed to add user.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New User</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Full Name" type="text" fullWidth variant="outlined" value={formData.name} onChange={onChange} required />
          <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="outlined" value={formData.email} onChange={onChange} required />
          <TextField margin="dense" name="password" label="Password" type="password" fullWidth variant="outlined" value={formData.password} onChange={onChange} required />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="outlined" value={formData.address} onChange={onChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} label="Role" onChange={onChange}>
              <MenuItem value="user">User</MenuItem><MenuItem value="store_owner">Store Owner</MenuItem><MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {message && <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add User</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// --- Add Store Dialog ---
const AddStoreDialog = ({ open, onClose, onStoreAdded, token, storeOwners }) => {
  const [formData, setFormData] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.post('http://localhost:5001/api/admin/stores', formData, config);
      onStoreAdded();
      onClose();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.msg || 'Failed to add store.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Store</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Store Name" type="text" fullWidth variant="outlined" value={formData.name} onChange={onChange} required />
          <TextField margin="dense" name="email" label="Store Email" type="email" fullWidth variant="outlined" value={formData.email} onChange={onChange} required />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="outlined" value={formData.address} onChange={onChange} />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Owner</InputLabel>
            <Select name="owner_id" value={formData.owner_id} label="Owner" onChange={onChange}>
              <MenuItem value="">-- Select Owner --</MenuItem>
              {storeOwners.map(owner => <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>)}
            </Select>
          </FormControl>
          {message && <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add Store</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

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
    <Paper sx={{ p: 2, mt: 4, maxWidth: 700 }}>
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


// --- Main AdminDashboard Component ---
const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '' });
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { 'x-auth-token': token } };
      const [statsRes, usersRes, storesRes, ownersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/dashboard', config),
        axios.get('http://localhost:5001/api/admin/users', { ...config, params: userFilters }),
        axios.get('http://localhost:5001/api/admin/stores', { ...config, params: storeFilters }),
        axios.get('http://localhost:5001/api/admin/store-owners', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
      setStoreOwners(ownersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  }, [userFilters, storeFilters, token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleTabChange = (event, newValue) => setTab(newValue);
  const handleUserFilterChange = e => setUserFilters({ ...userFilters, [e.target.name]: e.target.value });
  const handleStoreFilterChange = e => setStoreFilters({ ...storeFilters, [e.target.name]: e.target.value });

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5001/api/admin/users/${userId}`, { headers: { 'x-auth-token': token } });
        fetchData();
      } catch (error) {
        alert(error.response?.data?.msg || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await axios.delete(`http://localhost:5001/api/admin/stores/${storeId}`, { headers: { 'x-auth-token': token } });
        fetchData();
      } catch (error) {
        alert(error.response?.data?.msg || 'Failed to delete store.');
      }
    }
  };
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <AddUserDialog open={addUserOpen} onClose={() => setAddUserOpen(false)} onUserAdded={fetchData} token={token} />
      <AddStoreDialog open={addStoreOpen} onClose={() => setAddStoreOpen(false)} onStoreAdded={fetchData} token={token} storeOwners={storeOwners} />
      {editingUser && <EditUserDialog user={editingUser} open={!!editingUser} onClose={() => setEditingUser(null)} onUserUpdated={fetchData} token={token} />}
      {editingStore && <EditStoreDialog store={editingStore} open={!!editingStore} onClose={() => setEditingStore(null)} onStoreUpdated={fetchData} token={token} storeOwners={storeOwners} />}
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">Admin Dashboard</Typography>
          <Button variant="outlined" onClick={logout}>Logout</Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="Overview" />
            <Tab label="Users" />
            <Tab label="Stores" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          <Typography variant="h5" gutterBottom>Platform Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total Users</Typography><Typography variant="h3">{stats.totalUsers}</Typography></Paper></Grid>
            <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total Stores</Typography><Typography variant="h3">{stats.totalStores}</Typography></Paper></Grid>
            <Grid item xs={12} sm={4}><Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Total Ratings</Typography><Typography variant="h3">{stats.totalRatings}</Typography></Paper></Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>User Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddUserOpen(true)}>Add User</Button>
          </Toolbar>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <TextField label="Filter by Name" name="name" value={userFilters.name} onChange={handleUserFilterChange} size="small" />
            <TextField label="Filter by Email" name="email" value={userFilters.email} onChange={handleUserFilterChange} size="small" />
            <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Role</InputLabel><Select name="role" value={userFilters.role} label="Role" onChange={handleUserFilterChange}>
              <MenuItem value="">All Roles</MenuItem><MenuItem value="user">User</MenuItem><MenuItem value="store_owner">Store Owner</MenuItem><MenuItem value="admin">Admin</MenuItem>
            </Select></FormControl>
          </Box>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setEditingUser(user)}><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => handleDeleteUser(user.id)}><DeleteIcon color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Store Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddStoreOpen(true)}>Add Store</Button>
          </Toolbar>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <TextField label="Filter by Name" name="name" value={storeFilters.name} onChange={handleStoreFilterChange} size="small"/>
            <TextField label="Filter by Email" name="email" value={storeFilters.email} onChange={handleStoreFilterChange} size="small"/>
          </Box>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Owner</TableCell><TableCell>Avg. Rating</TableCell><TableCell align="right">Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {stores.map(store => (
                  <TableRow key={store.id} hover>
                    <TableCell>{store.name}</TableCell><TableCell>{store.email}</TableCell><TableCell>{store.ownerName || 'N/A'}</TableCell><TableCell>{store.rating ? parseFloat(store.rating).toFixed(1) : 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setEditingStore(store)}><EditIcon /></IconButton>
                      <IconButton size="small" onClick={() => handleDeleteStore(store.id)}><DeleteIcon color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tab} index={3}>
          <Typography variant="h5" gutterBottom>Account Settings</Typography>
          <ChangePasswordForm />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;