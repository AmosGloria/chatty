const { addOrUpdateChannelMember } = require('../models/channelMemberModel');

const inviteUserToChannel = async (req, res) => {
  const { userIdToInvite, role } = req.body;
  const channelId = req.params.id;

  try {
    await addOrUpdateChannelMember(channelId, userIdToInvite, role || 'Member');
    res.status(200).json({ message: 'User added or role updated in channel' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite user', detail: err.message });
  }
};

module.exports = {
  inviteUserToChannel,
};
