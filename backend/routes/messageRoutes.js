const express = require('express');
const { getMessages, send } = require('../controllers/messageController');
const router = express.Router();

// Get messages from a channel or direct messages (conversation)
router.get('/:channelId/messages', getMessages);  // Get messages from a channel
router.get('/conversation/:conversationId/messages', getMessages);  // Get direct messages (conversation)

// Send a message (either to a channel or as a direct message)
router.post('/messages', send);  // Send a message to a channel or a conversation

module.exports = router;
