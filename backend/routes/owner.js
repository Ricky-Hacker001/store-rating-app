const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const storeOwnerAuth = require('../middleware/storeOwnerAuth');

// Apply both middleware to all routes in this file
router.use(auth, storeOwnerAuth);

// @route   GET /api/owner/dashboard
// @desc    Get dashboard data for the store owner
router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const [stores] = await db.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.status(404).json({ msg: 'No store found for this owner.' });
    }
    const storeId = stores[0].id;

    // Get the average rating for their store
    const [avgRatingResult] = await db.query(
      'SELECT AVG(rating) as averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    );
    const averageRating = avgRatingResult[0].averageRating;

    // Get the list of users who rated their store
    const [raters] = await db.query(
      `SELECT u.name, u.email, r.rating 
       FROM ratings r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = ?`,
      [storeId]
    );

    res.json({ averageRating, raters });

  } catch (err) {
    console.error("Owner Dashboard Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;