// backend/db/connectDatabase.js
const mysql = require('mysql2/promise'); // Promise-based client
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chatty',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection()
  .then(connection => {
    console.log('Connected to MySQL');
    connection.release(); // Release the test connection
  })
  .catch(err => {
    console.error(' Database connection failed:', err.stack);
  });

module.exports = db;
