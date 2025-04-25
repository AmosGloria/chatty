const db = require('../connectDatabase');  // Using mysql2 connection

// Create a new channel
const createChannel = async (name, createdBy) => {
  const connection = await db.getConnection(); // get one connection from pool

  try {
    await connection.beginTransaction(); // start transaction

    // Step 1: Create the channel
    const [channelResult] = await connection.query(
      'INSERT INTO channels (name, created_by) VALUES (?, ?)',
      [name, createdBy]
    );
    const channelId = channelResult.insertId;

    // Step 2: Add the creator as Admin
    await connection.query(
      'INSERT INTO channel_members (channel_id, user_id, role) VALUES (?, ?, ?)',
      [channelId, createdBy, 'Admin']
    );

    await connection.commit(); // commit if successful

    connection.release(); // always release back to pool
    return { channelId, message: 'Channel created and creator set as Admin' };
  } catch (err) {
    await connection.rollback(); // rollback on error
    connection.release();
    throw err;
  }
};



// Get all channels
const getChannels = async () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM channels';
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createChannel,
  getChannels,
};
