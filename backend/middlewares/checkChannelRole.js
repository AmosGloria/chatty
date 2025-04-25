const { getChannelMemberRole } = require('../models/channelMemberModel');

const checkChannelRole = (requiredRole) => {
  return async (req, res, next) => {
    const user = req.user;
    const channelId = req.params.channelId || req.params.id;

    
    console.log(' Checking access for user:', user);
    console.log(' Required Role:', requiredRole, '| Channel ID:', channelId);

    //  If no user info
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found in request' });
    }

    //  If channel ID is missing
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is missing in the request parameters' });
    }

    try {
      // 🔍 Get member role
      const member = await getChannelMemberRole(channelId, user.userId);

      //  Not in the channel
      if (!member) {
        console.log(' User is not a member of this channel');
        return res.status(403).json({ error: 'Not a member of this channel' });
      }

      //  Insufficient role
      if (requiredRole === 'Admin' && member.role !== 'Admin') {
        console.log(` User's role is '${member.role}', but 'Admin' is required`);
        return res.status(403).json({ error: 'Admin permission required' });
      }

      //  All good
      console.log(' Access granted to channel');
      next();

    } catch (err) {
      console.error(' Error during role check:', err.message);
      res.status(500).json({ error: 'Role check failed', detail: err.message });
    }
  };
};

module.exports = checkChannelRole;
