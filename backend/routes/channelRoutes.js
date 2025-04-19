// backend/routes/channelRoutes.js
const express = require('express');
const { create, getAll } = require('../controllers/channelController');
const router = express.Router();

router.post('/', create); // Create channel
router.get('/', getAll);  // Get all channels

module.exports = router;
