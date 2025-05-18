// backend/controllers/channelController.js
const db = require('../connectDatabase');
const { createChannel, getChannels, getDefaultTeam, addUserToTeam } = require('../models/channelModel');
const { createDefaultTeam } = require('../models/teamModel');

const create = async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    const createdBy = req.user.userId;

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Channel name and authenticated user are required' });
    }

    const result = await createChannel(name, description, createdBy, category, isPrivate);
    await addCreatorToChannelMembers(result.channelId, createdBy);
    await createDefaultTeam(result.channelId, createdBy);

    const defaultTeam = await getDefaultTeam(result.channelId);
    const defaultTeamId = defaultTeam?.id || null;

    res.status(201).json({
      message: 'Workroom and default team created successfully',
      channelId: result.channelId,
      defaultTeamId
    });
  } catch (err) {
    console.error('Create channel error:', err.message);
    res.status(500).json({ error: 'failed to create workroom' });
  }
};


const addCreatorToChannelMembers = async (channelId, createdBy) => {
  try {
    const role = 'Admin';

    const [existing] = await db.query(
      'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
      [channelId, createdBy]
    );

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO channel_members (channel_id, user_id, role) VALUES (?, ?, ?)',
        [channelId, createdBy, role]
      );
      console.log(`Creator (user ${createdBy}) added to channel ${channelId}`);
    } else {
      console.log(`Creator (user ${createdBy}) is already a member of channel ${channelId}`);
    }

  } catch (error) {
    console.error('Error adding creator to channel members:', error.message);
    throw new Error('Failed to add creator as member');
  }
};


const joinChannel = async (req, res) => {
  const { channelId, userId } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM channel_members WHERE channel_id = ? AND user_id = ?',
      [channelId, userId]
    );

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)',
        [channelId, userId]
      );
    }

    const defaultTeam = await getDefaultTeam(channelId);

    if (defaultTeam) {
      await addUserToTeam(userId, defaultTeam.id);
    }

    res.status(200).json({ message: 'User joined work room and default team (if available).' });
  } catch (err) {
    console.error('Join work room error:', err);
    res.status(500).json({ error: 'Failed to join work room.' });
  }
};

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
