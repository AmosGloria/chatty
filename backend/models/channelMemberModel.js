const db = require('../connectDatabase');

// Add or update (toggle) user in channel with a specific role
const addOrUpdateChannelMember = async (channelId, userId, role = 'Member') => {
  const query = `
    INSERT INTO channel_members (channel_id, user_id, role)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE role = VALUES(role), updated_at = CURRENT_TIMESTAMP;
  `;

  try {
    const [result] = await db.query(query, [channelId, userId, role]);
    return result;
  } catch (err) {
    console.error('Error in addOrUpdateChannelMember:', err.message);
    throw err;
  }
};


// Get channel member and their role
const getChannelMemberRole = async (channelId, userId) => {
  try {
    const query = `SELECT role FROM channel_members WHERE channel_id = ? AND user_id = ?`;
    console.log('Querying role with:', channelId, userId);

    const [results] = await db.query(query, [channelId, userId]);

    console.log('Raw SQL results:', results);

    if (!results || results.length === 0) {
      console.warn('No role found for user in this channel');
      return null;
    }

    console.log('User role found:', results[0]);
    return results[0];
  } catch (err) {
    console.error('MySQL Query Error:', err.message);
    throw err;
  }
};



module.exports = {
  addOrUpdateChannelMember,
  getChannelMemberRole,
};
