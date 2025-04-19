// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const { registerUser, findUserByEmail, comparePassword } = require('../models/userModel');

// Signup Controller (Email/Password)
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await registerUser(name, email, password);
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Login Controller (Email/Password)
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).send('User not found');
    
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { signup, login };
