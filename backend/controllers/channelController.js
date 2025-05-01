// backend/controllers/channelController.js
const { createChannel, getChannels } = require('../models/channelModel');

const create = async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    const createdBy = req.user.userId; // from auth middleware

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Channel name and authenticated user are required' });
    }

    // Create the channel with description, category, and isPrivate
    const result = await createChannel(name, description, createdBy, category, isPrivate);
    res.status(201).json({ message: 'Workroom successfully created', channelId: result.channelId });
  } catch (err) {
    console.error('Create channel error:', err.message);
    res.status(500).json({ error: 'Failed to create workroom' });
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

module.exports = { create, getAll, getOne };