const db = require('../connectDatabase');
const { getMessagesByChannelOrConversation, getThreadReplies } = require('../models/messageModel');
const socket = require('socket.io-client')('http://localhost:5000');

const sendMessage = async (text, userId, channelId, conversationId) => {
  try {
    const [channelCheck] = await db.query(
      'SELECT * FROM channels WHERE id = ?',
      [channelId]
    );
    if (channelCheck.length === 0) throw new Error('Channel does not exist');

    const [result] = await db.query(
      'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
      [channelId, userId]
    );

    if (result.length === 0) {
      const [creatorCheck] = await db.query(
        'SELECT * FROM channels WHERE id = ? AND created_by = ?',
        [channelId, userId]
      );

      if (creatorCheck.length > 0) {
        const [existing] = await db.query(
          'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
          [channelId, userId]
        );

        if (existing.length === 0) {
          await db.query(
            'INSERT INTO channel_members (channel_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [channelId, userId, 'Admin']
          );
          console.log('Creator auto-added to channel_members');
        } else {
          console.log('Creator already exists in channel_members');
        }
      } else {
        throw new Error('User is not a member of this channel');
      }
    }

    const query = 'INSERT INTO messages (text, user_id, channel_id, conversation_id) VALUES (?, ?, ?, ?)';
    const [messageResult] = await db.query(query, [text, userId, channelId, conversationId]);

    const [message] = await db.query(
      `SELECT messages.*, users.name AS user_name, users.profile_picture AS user_profile_image 
       FROM messages 
       JOIN users ON messages.user_id = users.id 
       WHERE messages.id = ?`,
      [messageResult.insertId]
    );

    socket.emit('receiveMessage', {
      user_id: message.user_id,
      user_name: message.user_name,
      user_profile_image: message.user_profile_image,
      text: message.text,
      created_at: message.created_at,
      channel_id: message.channel_id,
    });

    return {
      success: true,
      message: 'Message sent successfully',
      messageId: messageResult.insertId,
      message: message[0],
    };
  } catch (error) {
    console.error('Error in sendMessage:', error.message);
    throw new Error('Failed to send message');
  }
};

const getMessages = async (req, res) => {
  const { channelId, conversationId } = req.params;
  try {
    const messages = await getMessagesByChannelOrConversation(channelId, conversationId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const replyToMessage = async (req, res) => {
  const { text, userId, channelId, conversationId, thread_id } = req.body;
  try {
    const result = await sendMessage(text, userId, channelId, conversationId, thread_id);
    res.status(201).json({
      message: 'Reply sent successfully',
      message_id: result.messageId,
    });
  } catch (err) {
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

const deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.userId;

  try {
    console.log(`DELETE /messages/${messageId} triggered by userId: ${userId}`);

    const [messages] = await db.query(
      'SELECT user_id, channel_id FROM messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      console.warn(`Message ID ${messageId} not found in DB.`);
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messages[0];
    console.log(` Message from DB:`, message);

    if (parseInt(message.user_id) !== parseInt(userId)) {
      const channelIdNum = Number(message.channel_id);
      const userIdNum = Number(userId);

      console.log(` Checking permissions for user ${userIdNum} on channel ${channelIdNum}`);

      const [admins] = await db.query(
        'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ? AND role = ?',
        [channelIdNum, userIdNum, 'Admin']
      );

      const [creators] = await db.query(
        'SELECT * FROM channels WHERE id = ? AND created_by = ?',
        [channelIdNum, userIdNum]
      );

      if (admins.length === 0 && creators.length === 0) {
        console.warn(` Access denied. User ${userIdNum} is neither admin nor creator of channel ${channelIdNum}`);
        return res.status(403).json({ error: 'You do not have permission to delete this message' });
      }
    }

    const [result] = await db.query('DELETE FROM messages WHERE id = ?', [messageId]);

    if (result.affectedRows === 0) {
      console.warn(` Message ID ${messageId} was not deleted. Possibly already removed.`);
      return res.status(404).json({ error: 'Message not found or already deleted' });
    }

    console.log(` Message ID ${messageId} deleted successfully.`);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(' Error deleting message:', err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};


module.exports = { sendMessage, getMessages, replyToMessage, getReplies, deleteMessage };
