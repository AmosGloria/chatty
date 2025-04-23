const { getMessagesByChannelOrConversation, sendMessage, getThreadReplies } = require('../models/messageModel');

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

module.exports = { getMessages, send, replyToMessage, getReplies };
