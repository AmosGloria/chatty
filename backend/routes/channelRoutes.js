const express = require('express');
const { create, getAll } = require('../controllers/channelController');
const authenticate = require('../middlewares/authMiddleware'); // Import your auth middleware
const router = express.Router();

// Add authenticate middleware to protect the POST route
router.post('/', authenticate, create); 
router.get('/', getAll); // Get all channels (can remain public)

module.exports = router;
