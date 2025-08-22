// In backend/db.js

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Your MySQL username
  password: process.env.DB_PASSWORD || '', // Your MySQL password
  database: process.env.DB_NAME || 'rating_system_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// To use async/await, we need to promise-fy the pool
module.exports = pool.promise();