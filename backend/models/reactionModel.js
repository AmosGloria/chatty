const db = require('../connectDatabase');

const addReaction = async (messageId, userId, emoji) => {
  const query = `INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)`;
  try {
    await db.query(query, [messageId, userId, emoji]);
    return { added: true };
  } catch (err) {
    throw err; // Let controller catch duplicate
  }
};

const removeReaction = async (messageId, userId, emoji) => {
  const query = `DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?`;
  await db.query(query, [messageId, userId, emoji]);
};

const getReactionsByMessage = async (messageId) => {
  const query = `SELECT emoji, COUNT(*) AS count FROM reactions WHERE message_id = ? GROUP BY emoji`;
  const [results] = await db.query(query, [messageId]);
  return results;
};

module.exports = { addReaction, removeReaction, getReactionsByMessage };
