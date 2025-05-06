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

const create = async (req, res) => {
  const { name, description, isPrivate } = req.body;
  const userId = req.user.userId;

  try {
    // Fetch the channel_id where the user is an Admin
    const channelId = await getChannelIdForAdmin(userId);

    if (!channelId) {
      return res.status(400).json({ error: 'User is not an admin of any channel.' });
    }

    // Create the team in the fetched channel
    const result = await createTeam(name, description, userId, isPrivate, channelId);
    res.status(201).json({ message: 'Team created', teamId: result.teamId });
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

const getTeamsForChannel = async (req, res) => {
  const { channelId } = req.params;
  try {
    // Ensure the query fetches the correct teams for the given channelId
    const teams = await getTeamsByChannel(channelId);  // Fetch teams for a given channel

    // Log to check the teams fetched
    console.log('Fetched teams:', teams);  // This should log an array of team objects

    const teamNames = teams.map(team => ({ name: team.name }));  // Only send team names

    res.status(200).json(teamNames);  // Return only the names of teams
  } catch (error) {
    console.error('Error fetching teams for channel:', error);
    res.status(500).json({ error: 'Failed to fetch teams for channel' });
  }
};


module.exports = { create, createSubteam, getTeamsForChannel };
