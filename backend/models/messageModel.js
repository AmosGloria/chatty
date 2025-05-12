const db = require('../connectDatabase'); // Using mysql2 connection

// Get messages for a specific channel (or direct messages for a user)
const getMessagesByChannelOrConversation = async (channelId, conversationId) => {
  let query;
  let queryParams = [];
  
  if (channelId) {
 query = `
  SELECT 
    messages.*,
    users.name AS user_name,
    users.profile_picture AS user_profile_image
  FROM messages
  JOIN users ON messages.user_id = users.id
  WHERE messages.channel_id = ?
  ORDER BY messages.created_at ASC
`;


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
const insertMessage = async (text, userId, channelId, conversationId, threadId = null) => {
  const query = `INSERT INTO messages (text, user_id, channel_id, conversation_id, thread_id)
                 VALUES (?, ?, ?, ?, ?)`;
  const [result] = await db.query(query, [text, userId, channelId || null, conversationId || null, threadId]);
  return result;
};

const getThreadReplies = async (parentMessageId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC';
    db.query(query, [parentMessageId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


module.exports = {
  getMessagesByChannelOrConversation,
  insertMessage,
  getThreadReplies,
};
