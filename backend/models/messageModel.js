const db = require('../connectDatabase'); // Using mysql2 connection

// Get messages for a specific channel (or direct messages for a user)
const getMessagesByChannelOrConversation = async (channelId, conversationId) => {
  let query;
  let queryParams = [];
  
  if (channelId) {
    query = 'SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at ASC';
    queryParams = [channelId];
  } else if (conversationId) {
    query = 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC';
    queryParams = [conversationId];
  }

  return new Promise((resolve, reject) => {
    db.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Send a message to a channel or a direct message between two users
const sendMessage = async (text, userId, channelId, conversationId) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO messages (text, user_id, channel_id, conversation_id) VALUES (?, ?, ?, ?)';
    db.query(query, [text, userId, channelId || null, conversationId || null], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getMessagesByChannelOrConversation,
  sendMessage,
};
