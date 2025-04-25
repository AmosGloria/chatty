const express = require('express');
const { getMessages, sendMessage, replyToMessage, getReplies, deleteMessage } = require('../controllers/messageController');
const authenticate = require('../middlewares/authMiddleware');
const checkChannelRole = require('../middlewares/checkChannelRole');
const router = express.Router();

// Get messages from a channel or direct messages (conversation)
router.get('/:channelId/messages', getMessages);  // Get messages from a channel
router.get('/conversation/:conversationId/messages', getMessages);  // Get direct messages (conversation)

// Send a message (either to a channel or as a direct message)
router.post('/', sendMessage); // Send a message to a channel or a conversation

router.post('/reply', replyToMessage); // POST /api/messages/reply

router.get('/:id/threads', getReplies); // GET /api/messages/:id/threads

router.delete('/:id', authenticate, checkChannelRole('Admin'), deleteMessage);

module.exports = router;
