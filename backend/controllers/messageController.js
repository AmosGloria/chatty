const db = require('../connectDatabase');
const { getMessagesByChannelOrConversation, getThreadReplies } = require('../models/messageModel');

// Get messages from a channel or direct messages from a conversation
const getMessages = async (req, res) => {
  const { channelId, conversationId } = req.params;
  try {
    const messages = await getMessagesByChannelOrConversation(channelId, conversationId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Send a message to a channel or as a direct message
const sendMessage = async (text, userId, channelId, conversationId) => {
  // Check if user is a member of the channel
  const [result] = await db.query(
    'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
    [channelId, userId]
  );

  if (result.length === 0) {
    throw new Error('User is not a member of this channel');
  }

  // Proceed with sending the message to the channel
  const query = 'INSERT INTO messages (text, user_id, channel_id, conversation_id) VALUES (?, ?, ?, ?)';
  const [messageResult] = await db.query(query, [text, userId, channelId, conversationId]);
  return messageResult;
};


const replyToMessage = async (req, res) => {
  const { text, userId, channelId, conversationId, thread_id } = req.body;

  console.log(" Incoming reply body:", req.body);

  try {
    const result = await sendMessage(text, userId, channelId, conversationId, thread_id);

    console.log("Reply inserted with ID:", result.insertId);

    res.status(201).json({
      message: 'Reply sent successfully',
      message_id: result.insertId
    }); //  THIS is what was likely missing!
  } catch (err) {
    console.error(" Error sending reply:", err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};



const getReplies = async (req, res) => {
  const thread_id = req.params.id;
  try {
    const replies = await getThreadReplies(thread_id);
    res.status(200).json(replies);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Delete a message by ID (Admins only)
const deleteMessage = async (req, res) => {
  const messageId = req.params.id;

  try {
    const [result] = await db.query(
      'DELETE FROM messages WHERE id = ?',
      [messageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found or already deleted' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(' Error deleting message:', err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = { getMessages, sendMessage, replyToMessage, getReplies, deleteMessage };
