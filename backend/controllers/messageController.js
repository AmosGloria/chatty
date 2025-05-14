const db = require('../connectDatabase');
const { getMessagesByChannelOrConversation, getThreadReplies } = require('../models/messageModel');
const socket = require('socket.io-client')('http://localhost:5000'); 

// Send a message to a channel or as a direct message
const sendMessage = async (text, userId, channelId, conversationId) => {
  try {
    // Check if the channel exists
    const [channelCheck] = await db.query(
      'SELECT * FROM channels WHERE id = ?',
      [channelId]
    );
    if (channelCheck.length === 0) {
      throw new Error('Channel does not exist');
    }

    // Check if the user is a member of the channel
    const [result] = await db.query(
      'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
      [channelId, userId]
    );
    console.log('Channel member check result:', result);

    if (result.length === 0) {
      // If the user is not a member, check if they are the creator
      console.log('User is not a member, checking if they are the creator...');
      const [creatorCheck] = await db.query(
        'SELECT * FROM channels WHERE id = ? AND created_by = ?',
        [channelId, userId]
      );
      console.log('Creator check result:', creatorCheck);

      // If the user is the creator, automatically consider them a member
      if (creatorCheck.length > 0) {
        console.log('User is the creator, auto-adding them to channel_members...');
        await db.query(
          'INSERT INTO channel_members (channel_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [channelId, userId, 'Admin']
        );
      } else {
        throw new Error('User is not a member of this channel');
      }
    }

    // Proceed with sending the message to the channel
    const query = 'INSERT INTO messages (text, user_id, channel_id, conversation_id) VALUES (?, ?, ?, ?)';
    const [messageResult] = await db.query(query, [text, userId, channelId, conversationId]);

    // Fetch the message with user info (name, profile picture)
    const [message] = await db.query(
      `SELECT messages.*, users.name AS user_name, users.profile_picture AS user_profile_image 
       FROM messages 
       JOIN users ON messages.user_id = users.id 
       WHERE messages.id = ?`, 
      [messageResult.insertId]
    );

    // Emit the new message through socket.io
   socket.emit('receiveMessage', {
  user_id: message.user_id,
  user_name: message.user_name,
  user_profile_image: message.user_profile_image,
  text: message.text,
  created_at: message.created_at,
}); // Emit message to frontend


    return { success: true, message: 'Message sent successfully', messageId: messageResult.insertId, message: message[0] };

  } catch (error) {
    console.error('Error in sendMessage:', error.message);
    throw new Error('Failed to send message');
  }
};

// Get messages from a channel or direct messages from a conversation
const getMessages = async (req, res) => {
  const { channelId, conversationId } = req.params;
  console.log(`Fetching messages for channel ID: ${channelId}`); // Log the channelId being requested

  try {
    const messages = await getMessagesByChannelOrConversation(channelId, conversationId);
    
    console.log('Messages fetched:', messages); // Log the messages being returned from the database
    if (messages.length === 0) {
      console.log('No messages found for the channel');
    }
    res.status(200).json(messages); // Ensure the correct data is being returned in the response
  } catch (err) {
    console.error('Error fetching messages:', err); // Log any errors
    res.status(400).send(err.message); // Send the error message to Postman
  }
};

const replyToMessage = async (req, res) => {
  const { text, userId, channelId, conversationId, thread_id } = req.body;

  console.log(" Incoming reply body:", req.body);

  try {
    const result = await sendMessage(text, userId, channelId, conversationId, thread_id);

    console.log("Reply inserted with ID:", result.messageId);

    res.status(201).json({
      message: 'Reply sent successfully',
      message_id: result.messageId,
    }); // Return messageId with response
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

module.exports = { sendMessage, getMessages, replyToMessage, getReplies, deleteMessage };
