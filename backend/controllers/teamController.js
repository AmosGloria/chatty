const db = require('../connectDatabase');  

const { createTeam, canUserCreateTeam, getTeamsByChannel } = require('../models/teamModel');

// Fetch the channel_id where the user is an Admin
const getChannelIdForAdmin = async (userId) => {
  try {
    const [rows] = await db.query(
      'SELECT channel_id FROM channel_members WHERE user_id = ? AND role = ?',
      [userId, 'Admin']
    );
    return rows.length > 0 ? rows[0].channel_id : null;
  } catch (err) {
    console.error('Error fetching channel_id for admin:', err);
    throw new Error('Failed to fetch channel_id');
  }
};

// Create team
const create = async (req, res) => {
  const { name, description, isPrivate, channelId } = req.body;
  const userId = req.user.userId;

  try {
    const result = await createTeam(name, description, userId, isPrivate, channelId);
    res.status(201).json({ message: 'Team created successfully', teamId: result.teamId, teamName: name });
  } catch (err) {
    console.error('Team creation error:', err);
    res.status(500).json({ error: 'Team creation failed' });
  }
};

// Create a sub-team (same logic, using parent team's channelId)
const createSubteam = async (req, res) => {
  const { parentTeamId } = req.params;
  const { name, description, isPrivate } = req.body;
  const userId = req.user.userId;

  const allowed = await canUserCreateTeam(userId, parentTeamId);
  if (!allowed) {
    return res.status(403).json({ error: 'Not authorized to create sub-teams' });
  }

  try {
    // We assume that the parent team is also in a channel the user is an admin of
    const channelId = await getChannelIdForAdmin(userId);

    if (!channelId) {
      return res.status(400).json({ error: 'User is not an admin of any channel.' });
    }

    const result = await createTeam(name, description, userId, isPrivate, channelId);
    res.status(201).json({ message: 'Sub-team created', teamId: result.teamId });
  } catch (err) {
    console.error('Sub-team creation error:', err);
    res.status(500).json({ error: 'Sub-team creation failed' });
  }
};

// Get teams for a specific channel
const getTeamsForChannel = async (req, res) => {
  const { channelId } = req.params;

  try {
    const teams = await getTeamsByChannel(channelId);
    res.status(200).json(teams);  // Return the teams data
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams for the channel' });
  }
};


module.exports = { create, createSubteam, getTeamsForChannel };