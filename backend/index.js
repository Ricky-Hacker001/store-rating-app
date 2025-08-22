const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Import validator functions
require('dotenv').config();

const db = require('./db');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());


// --- API Routes ---

// Use Routers for different parts of the API
app.use('/api/admin', require('./routes/admin'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/users', require('./routes/users')); // For password changes, etc.

// Public Registration Route with Validation
app.post('/api/auth/register',
  // Validation middleware chain
  body('name', 'Name must be between 20 and 60 characters').isLength({ min: 20, max: 60 }),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 8-16 characters, with an uppercase letter and a special character')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/),
  body('address', 'Address cannot exceed 400 characters').optional().isLength({ max: 400 }),
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, address } = req.body;
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) return res.status(409).json({ message: 'Email already in use.' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = { name, email, password: hashedPassword, address, role: 'user' };
        await db.query('INSERT INTO users SET ?', newUser);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Public Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Public Store and Rating Routes
app.get('/api/stores', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    let query = `
      SELECT 
        s.id, s.name, s.email, s.address,
        AVG(r.rating) AS averageRating,
        (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) AS userRating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    const queryParams = [userId];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.address LIKE ?`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.name ASC`;
    const [stores] = await db.query(query, queryParams);
    res.json(stores);
  } catch (error) {
    console.error('Get Stores Error:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/api/stores/:storeId/ratings', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const { storeId } = req.params;
    const userId = req.user.id;
    if (rating < 1 || rating > 5) return res.status(400).json({ msg: 'Rating must be between 1 and 5.' });
    
    const sql = `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?`;
    await db.query(sql, [userId, storeId, rating, rating]);
    res.json({ msg: 'Rating submitted successfully.' });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).send('Server Error');
  }
});

// --- Server Listener ---
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});