// backend/controllers/channelController.js
const { createChannel, getChannels } = require('../models/channelModel');

const create = async (req, res) => {
  try {
    const name = req.body.name;
    const createdBy = req.user.userId; // from auth middleware

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Channel name and authenticated user are required' });
    }

    const result = await createChannel(name, createdBy);
    res.status(201).json(result);
  } catch (err) {
    console.error('Create channel error:', err.message);
    res.status(500).json({ error: 'Failed to create channel' });
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

module.exports = { create, getAll };
