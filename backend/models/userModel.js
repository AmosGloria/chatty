// backend/models/userModel.js
const bcrypt = require('bcryptjs');
const db = require('../connectDatabase');

// Register a user
const registerUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  await db.promise().query(query, [name, email, hashedPassword]);
};

// Find a user by email
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.promise().query(query, [email]);
  return rows[0]; // Return the first matching user
};

// Compare password with hashed password in the database
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { registerUser, findUserByEmail, comparePassword };
