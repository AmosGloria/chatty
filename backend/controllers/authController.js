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

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login with Google ID Token (from Postman or mobile)
const loginWithGoogleToken = async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: 'ID token is required' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists in DB
    let user = await findUserByEmail(email);

    if (!user) {
      // Register new user if not found
      await registerUser(name, email, null); // null password if Google-only
      user = await findUserByEmail(email);
    }

    // Issue your own JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.username, email, picture } });
  } catch (error) {
    console.error('Google token login error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
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
  loginWithGoogleToken,
};
