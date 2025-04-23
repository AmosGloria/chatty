const jwt = require('jsonwebtoken');
const {
  registerUser,
  findUserByEmail,
  comparePassword,
  findUserById,
  updateUserProfile,
} = require('../models/userModel');

const welcome = (req, res) => {
  res.json({ message: 'Welcome to the Chaty Backend API!' });
};

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

//  Get Logged-in User Profile
const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.userId;

    await updateUserProfile(userId, updates);
    const updatedUser = await findUserById(userId);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

//  Export everything
module.exports = {
  welcome,
  signup,
  login,
  getProfile,
  getUserById,
  updateProfile,
};
