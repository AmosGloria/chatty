// backend/routes/authRoutes.js
const jwt = require('jsonwebtoken');
const express = require('express');
const passport = require('passport');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// Signup Route (Email/Password)
router.post('/signup', signup);

// Login Route (Email/Password)
router.post('/login', login);

// Google login route
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Google callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  }
);

module.exports = router;
