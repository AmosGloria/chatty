const {
  addReaction,
  removeReaction,
  getReactionsByMessage,
} = require('../models/reactionModel');

const toggle = async (req, res) => {
  const { messageId, userId, emoji } = req.body;

  if (!emoji || typeof emoji !== 'string') {
    return res.status(400).json({ error: 'Emoji is required and must be a string' });
  }

  console.log("Reaction Payload:", { messageId, userId, emoji });

  try {
    await addReaction(messageId, userId, emoji);
    req.io.emit('reactionAdded', { messageId, userId, emoji });
    return res.status(201).json({ message: 'Reaction added' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      try {
        await removeReaction(messageId, userId, emoji);
        req.io.emit('reactionRemoved', { messageId, userId, emoji });
        return res.status(200).json({ message: 'Reaction removed (toggled)' });
      } catch (removeError) {
        console.error("Failed to remove reaction:", removeError);
        return res.status(500).json({ error: 'Could not remove reaction' });
      }
    }

    console.error("Failed to toggle reaction:", err);
    return res.status(500).json({ error: 'Unexpected error while toggling reaction' });
  }
};

const remove = async (req, res) => {
  const { messageId, userId, emoji } = req.body;

  try {
    await removeReaction(messageId, userId, emoji);
    req.io.emit('reactionRemoved', { messageId, userId, emoji });
    res.status(200).json({ message: 'Reaction removed' });
  } catch (err) {
    console.error("Error removing reaction:", err);
    res.status(400).json({ error: err.message });
  }
};

const getByMessage = async (req, res) => {
  try {
    const reactions = await getReactionsByMessage(req.params.id);
    res.status(200).json(reactions);
  } catch (err) {
    console.error("Error getting reactions:", err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { toggle, remove, getByMessage };
