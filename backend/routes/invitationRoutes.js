const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const authenticate = require('../middlewares/authMiddleware'); // Your auth middleware

// 1. Send an invitation (any user in channel can invite)
router.post('/invite', authenticate, invitationController.sendInvitation);

// 2. Invited user accepts or declines invite
router.patch('/respond/:inviteId', authenticate, invitationController.respondToInvitation);

module.exports = router;
