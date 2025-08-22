const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Apply auth and adminAuth middleware to all routes in this file
router.use(auth, adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.query('SELECT COUNT(*) as count FROM ratings');
    
    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (with filtering)
router.get('/users', async (req, res) => {
  try {
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1 = 1';
    const queryParams = [];

    if (req.query.name) {
      query += ' AND name LIKE ?';
      queryParams.push(`%${req.query.name}%`);
    }
    if (req.query.email) {
      query += ' AND email LIKE ?';
      queryParams.push(`%${req.query.email}%`);
    }
    if (req.query.role) {
      query += ' AND role = ?';
      queryParams.push(req.query.role);
    }

    const [users] = await db.query(query, queryParams);
    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/store-owners
// @desc    Get all users with the store_owner role
router.get('/store-owners', async (req, res) => {
  try {
    const [owners] = await db.query(
      "SELECT id, name FROM users WHERE role = 'store_owner'"
    );
    res.json(owners);
  } catch (err) {
    console.error("Get Store Owners Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/stores
// @desc    Get all stores, including owner's name
router.get('/stores', async (req, res) => {
  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, AVG(r.rating) AS rating, u.name as ownerName
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1 = 1
    `;
    const queryParams = [];

    if (req.query.name) {
      query += ' AND s.name LIKE ?';
      queryParams.push(`%${req.query.name}%`);
    }
    if (req.query.email) {
      query += ' AND s.email LIKE ?';
      queryParams.push(`%${req.query.email}%`);
    }

    query += ' GROUP BY s.id ORDER BY s.name ASC';

    const [stores] = await db.query(query, queryParams);
    res.json(stores);
  } catch (err) {
    console.error("Get Stores Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/users
// @desc    Add a new user
router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all required fields.' });
  }

  try {
    const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(409).json({ msg: 'Email already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { name, email, password: hashedPassword, address, role };
    await db.query('INSERT INTO users SET ?', newUser);
    
    res.status(201).json({ msg: 'User created successfully.' });
  } catch (err) {
    console.error("Add User Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/stores
// @desc    Add a new store, with a mandatory and validated owner
router.post('/stores', async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !owner_id) {
    return res.status(400).json({ msg: 'Please enter name, email, and select an owner.' });
  }

  try {
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [owner_id]);
    if (users.length === 0) {
      return res.status(404).json({ msg: 'Selected owner user not found.' });
    }
    if (users[0].role !== 'store_owner') {
      return res.status(400).json({ msg: 'The selected user is not a Store Owner. Please select a valid owner.' });
    }
    
    const [storeExists] = await db.query(
      'SELECT id FROM stores WHERE email = ? AND owner_id = ?', 
      [email, owner_id]
    );
    if (storeExists.length > 0) {
      return res.status(409).json({ msg: 'This owner already has a store with that email address.' });
    }

    const newStore = { name, email, address, owner_id };
    await db.query('INSERT INTO stores SET ?', newStore);
    res.status(201).json({ msg: 'Store created successfully and assigned to owner.' });
  } catch (err) {
    console.error("Add Store Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
router.put('/users/:id', async (req, res) => {
  const { name, email, address, role } = req.body;
  const userIdToUpdate = req.params.id;

  // Business rule: Prevent changing role to 'store_owner' via editing
  if (role && role === 'store_owner') {
    return res.status(400).json({ msg: "Cannot change role to 'store_owner'. Please create a new store owner user." });
  }

  try {
    // Build update query dynamically
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (address) fieldsToUpdate.address = address;
    if (role) fieldsToUpdate.role = role;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    await db.query('UPDATE users SET ? WHERE id = ?', [fieldsToUpdate, userIdToUpdate]);
    res.json({ msg: 'User updated successfully.' });
  } catch (err) {
    console.error("Update User Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
  const userIdToDelete = req.params.id;
  
  // Prevent admin from deleting themselves
  if (req.user.id == userIdToDelete) {
    return res.status(400).json({ msg: "You cannot delete your own admin account." });
  }

  try {
    await db.query('DELETE FROM users WHERE id = ?', [userIdToDelete]);
    res.json({ msg: 'User deleted successfully.' });
  } catch (err) {
    console.error("Delete User Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/stores/:id
// @desc    Update a store
router.put('/stores/:id', async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  const storeIdToUpdate = req.params.id;

  try {
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (address) fieldsToUpdate.address = address;
    if (owner_id) fieldsToUpdate.owner_id = owner_id;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    await db.query('UPDATE stores SET ? WHERE id = ?', [fieldsToUpdate, storeIdToUpdate]);
    res.json({ msg: 'Store updated successfully.' });
  } catch (err) {
    console.error("Update Store Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/stores/:id
// @desc    Delete a store
router.delete('/stores/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stores WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Store deleted successfully.' });
  } catch (err) {
    console.error("Delete Store Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;