// backend/controllers/channelController.js
const { createChannel, getChannels } = require('../models/channelModel');

const create = async (req, res) => {
  const { name, createdBy } = req.body;
  try {
    await createChannel(name, createdBy);
    res.status(201).send('Channel created successfully');
  } catch (err) {
    res.status(400).send(err.message);
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
