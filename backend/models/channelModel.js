const db = require('../connectDatabase');  // Using mysql2 connection

// Create a new channel (Workspace)
const createChannel = async (name, description, createdBy, category, isPrivate) => {
  const connection = await db.getConnection(); // get one connection from pool

  try {
    await connection.beginTransaction(); // start transaction

    // Step 1: Create the channel with new fields (description, category, isPrivate)
    const [channelResult] = await connection.query(
      'INSERT INTO channels (name, description, created_by, category, is_private) VALUES (?, ?, ?, ?, ?)',
      [name, description, createdBy, category, isPrivate]
    );
    const channelId = channelResult.insertId;

    const invitationLink = `http://localhost:3000/invite/${channelId}`;

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

// Add user to a work room
const addUserToChannel = async (userId, workRoomId) => {
  await db.query(
    'INSERT INTO channel_members (user_id, channel_id) VALUES (?, ?)',
    [userId, channelId]
  );
};

// Get the default team for a work room
const getDefaultTeam = async (channelId) => {
  const [rows] = await db.query(
    'SELECT id FROM teams WHERE work_room_id = ? AND is_default = TRUE LIMIT 1',
    [channelId]
  );
  return rows[0];
};

// Add user to a team
const addUserToTeam = async (userId, teamId) => {
  await db.query(
    'INSERT INTO team_members (user_id, team_id) VALUES (?, ?)',
    [userId, teamId]
  );
};

// Get all channels along with the number of members for each channel
const getChannels = async () => {
  const query = `
    SELECT c.id, c.name, COUNT(cm.user_id) AS membersCount 
    FROM channels c
    LEFT JOIN channel_members cm ON cm.channel_id = c.id
    GROUP BY c.id;
  `;
  
  // Using promise-based db.query method
  const [results] = await db.query(query); // Await the promise to resolve
  
  return results;
};

const getChannelById = async (channelId) => {
  const [rows] = await db.query('SELECT * FROM channels WHERE id = ?', [channelId]);
  return rows[0];
};

module.exports = {
  createChannel,
  getChannels,
  getChannelById,
  addUserToChannel,
  getDefaultTeam,
  addUserToTeam,
};