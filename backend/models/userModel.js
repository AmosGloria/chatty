const bcrypt = require('bcryptjs');
const db = require('../connectDatabase');

const findUserById = async (id) => {
  const [results] = await db.query(
    'SELECT id, name AS username, email, profile_picture, status FROM users WHERE id = ?',
    [id]
  );
  return results[0];
};

// Register a user
const registerUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  await db.query(query, [name, email, hashedPassword]);
};

// Find a user by emai
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.query(query, [email]);
  return rows[0]; // Return the first matching user
};

const updateUserProfile = async (id, updates) => {
  const fields = [];
  const values = [];

  if (updates.username) {
    fields.push('name = ?');
    values.push(updates.username);
  }

  if (updates.profile_picture) {
    fields.push('profile_picture = ?');
    values.push(updates.profile_picture);
  }

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length === 0) return;

  values.push(id); // user id for WHERE clause

  const [result] = await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return result;
};


// Compare password with hashed password in the database
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};



module.exports = {
  registerUser,
  findUserByEmail,
  comparePassword,
  findUserById,
  updateUserProfile,
};
