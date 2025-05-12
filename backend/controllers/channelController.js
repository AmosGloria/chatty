// backend/controllers/channelController.js
const { createChannel, getChannels, getDefaultTeam, addUserToTeam } = require('../models/channelModel');
const { createDefaultTeam } = require('../models/teamModel');

const create = async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    const createdBy = req.user.userId; // from auth middleware

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Channel name and authenticated user are required' });
    }

    // Create the channel with description, category, and isPrivate
    const result = await createChannel(name, description, createdBy, category, isPrivate);

    // Add the creator to channel_members table (role can be set as 'Admin' or similar)
    await addCreatorToChannelMembers(result.channelId, createdBy);

    // After channel creation, create the default #general team
    await createDefaultTeam(result.channelId, createdBy);

    res.status(201).json({ message: 'Workroom and default team created successfully', channelId: result.channelId });
  } catch (err) {
    console.error('Create channel error:', err.message);
    res.status(500).json({ error: 'Failed to create workroom' });
  }
};

// Add creator to the channel_members table
const addCreatorToChannelMembers = async (channelId, createdBy) => {
  try {
    // Insert the creator as a member of the channel with role (you can set 'Admin' or any default role)
    const role = 'Admin'; // This could be 'Admin', 'Member', etc.
    await db.query(
      'INSERT INTO channel_members (channel_id, user_id, role) VALUES (?, ?, ?)',
      [channelId, createdBy, role]
    );
    console.log(`Creator (user ${createdBy}) added to channel ${channelId}`);
  } catch (error) {
    console.error('Error adding creator to channel members:', error.message);
    throw new Error('Failed to add creator as member');
  }
};

// Join Work Room and Auto-Join Default Team
const joinChannel = async (req, res) => {
  const { channelId, userId } = req.body;

  try {
    // Add user to the work room
    await db.query(
      'INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)',
      [channelId, userId]
    );

    // Check if a default team exists for the work room
    const defaultTeam = await getDefaultTeam(channelId);

    // Add user to default team if found
    if (defaultTeam) {
      await addUserToTeam(userId, defaultTeam.id);
    }

    res.status(200).json({ message: 'User joined work room and default team (if available).' });
  } catch (err) {
    console.error('Join work room error:', err);
    res.status(500).json({ error: 'Failed to join work room.' });
  }
};

// Get all channels
const getAll = async (req, res) => {
  try {
    const channels = await getChannels();
    res.status(200).json(channels);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  try {
    const channel = await getChannelById(req.params.id);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
};

module.exports = { create, addCreatorToChannelMembers, joinChannel, getAll, getOne };
