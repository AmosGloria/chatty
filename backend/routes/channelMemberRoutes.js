const express = require('express');
const router = express.Router();
const { inviteUserToChannel } = require('../controllers/channelMemberController');
const checkChannelRole = require('../middlewares/checkChannelRole');
const authenticate = require('../middlewares/authMiddleware'); // assumes JWT or session auth

// routes/channelMemberRoutes.js
router.post(
    '/:id/invite',
    authenticate,
    checkChannelRole('Admin'),
    inviteUserToChannel
  );
  

module.exports = router;
