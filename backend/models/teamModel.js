const db = require('../connectDatabase');

// Fetch the channel_id where the user is an Admin
const getChannelIdForAdmin = async (userId) => {
  const [rows] = await db.query(
    'SELECT channel_id FROM channel_members WHERE user_id = ? AND role = ?',
    [userId, 'Admin']
  );
  return rows.length > 0 ? rows[0].channel_id : null;
};

const createTeam = async (name, description, createdBy, isPrivate, channel_id, is_Default = false) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [teamRes] = await conn.query(
      'INSERT INTO teams (channel_id, name, description, created_by, is_private, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [channel_id, name, description, createdBy, isPrivate, is_Default]
    );
    const teamId = teamRes.insertId;

    await conn.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, createdBy, 'Admin']
    );

    await conn.commit();
    return { teamId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// Can a user create a team
const canUserCreateTeam = async (userId, teamId) => {
  const [rows] = await db.query(
    'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
    [teamId, userId]
  );
  if (!rows.length) return false;
  const role = rows[0].role;
  return role === 'Admin' || role === 'TeamCreator';
};

// Create a default team (#announcements) for the workroom
const createDefaultTeam = async (channelId, createdBy) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch channel_id based on the creator's admin role
    const channelId = await getChannelIdForAdmin(createdBy);
    if (!channelId) {
      throw new Error('User is not an admin of any channel.');
    }

    // Insert the default team for the workroom
    const [teamRes] = await conn.query(
      'INSERT INTO teams (name, description, created_by, is_private, channel_id, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      ['#announcements', 'Default team for general announcements', createdBy, false, channelId, true]
    );
    const teamId = teamRes.insertId;

    // Make the creator an Admin
    await conn.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, createdBy, 'Admin']
    );

    await conn.commit();
    return { teamId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Get all teams by channel_id
const getTeamsByChannel = async (channelId) => {
  const [rows] = await db.query(
    'SELECT * FROM teams WHERE channel_id = ?', 
    [channelId]
  );
  return rows;
};

module.exports = { createTeam, canUserCreateTeam, createDefaultTeam, getTeamsByChannel };