const express = require('express');
const { getMessages, sendMessage, replyToMessage, getReplies, deleteMessage } = require('../controllers/messageController');
const authenticate = require('../middlewares/authMiddleware');
const checkChannelRole = require('../middlewares/checkChannelRole');
const router = express.Router();

// Get messages from a channel or direct messages (conversation)

router.get('/conversation/:conversationId/messages', getMessages);  // Get direct messages (conversation)

router.get('/:channelId/messages', getMessages);  // Get messages from a channel

// Send a message (either to a channel or as a direct message)
router.post('/', async (req, res) => {
    const { text, userId, channelId, conversationId } = req.body;
  
    try {
      const result = await sendMessage(text, userId, channelId, conversationId);
      res.status(201).json(result); // Send back success message and messageId
    } catch (error) {
      console.error('Error sending message:', error.message);
      res.status(500).json({ error: error.message }); // Return the error message to frontend
    }
  });
  

router.post('/reply', replyToMessage); // POST /api/messages/reply

router.get('/:id/threads', getReplies); // GET /api/messages/:id/threads

router.delete('/:id', authenticate, checkChannelRole('Admin'), deleteMessage);

module.exports = router;
