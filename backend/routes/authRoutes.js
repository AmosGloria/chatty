// backend/routes/authRoutes.js
const jwt = require('jsonwebtoken');
const express = require('express');
const passport = require('passport');
const { signup, login, getProfile, getUserById, updateProfile, loginWithGoogleToken } = require('../controllers/authController');
const requireAuth = require('../middlewares/authMiddleware'); 
const router = express.Router();

// Signup Route (Email/Password)
router.post('/signup', signup);

// Login Route (Email/Password)
router.post('/login', login);

// POST /auth/google/token — for Postman/mobile login
router.post('/google/token', loginWithGoogleToken);

// Google login route (corrected with accessType and prompt)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',  
  prompt: 'consent',       
}));

// Google callback route (redirects with token)
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:5173/google-success?token=${token}`);  // <--- changed from res.json() to res.redirect()
  }
);

// Protected Routes
router.get('/profile', requireAuth, getProfile);
router.get('/user/:id', getUserById);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
