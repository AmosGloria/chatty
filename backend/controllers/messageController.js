const { getMessagesByChannelOrConversation, sendMessage } = require('../models/messageModel');

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
const send = async (req, res) => {
  const { text, userId, channelId, conversationId } = req.body;
  try {
    await sendMessage(text, userId, channelId, conversationId); // Send message to DB
    res.status(201).send('Message sent successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { getMessages, send };
