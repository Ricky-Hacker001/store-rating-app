const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

// @route   PUT /api/users/password
// @desc    Change user password
router.put('/password',
  auth, // Protect the route
  body('newPassword', 'Password must be 8-16 characters, with an uppercase letter and a special character')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$&*]).{8,16}$/),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      const user = users[0];

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;