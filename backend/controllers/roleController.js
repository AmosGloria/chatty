const db = require('../connectDatabase');

// Ensure you import this correctly if you're using it
const getUserRoleInChannel = async (userId, channelId) => {
  const [rows] = await db.query(
    'SELECT role FROM channel_members WHERE user_id = ? AND channel_id = ?',
    [userId, channelId]
  );
  return rows[0]?.role || null;
};

// Create a new custom role in a channel
const createRole = async (req, res) => {
  const { channelId } = req.params;
  const { roleName, permissions } = req.body;

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized user' });
  }

  try {
    const userRole = await getUserRoleInChannel(userId, channelId);
    if (userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can create roles.' });
    }

    const [result] = await db.query(
      'INSERT INTO roles (channel_id, name, permissions) VALUES (?, ?, ?)',
      [channelId, roleName, JSON.stringify(permissions)]
    );

    res.status(201).json({ message: 'Role created', roleId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Assign a custom role to a user
const assignRole = async (req, res) => {
  const { channelId, userId } = req.params;
  const { roleId } = req.body;
  const requestingUserId = req.user?.id;

  if (!requestingUserId) {
    return res.status(401).json({ error: 'Unauthorized user' });
  }

  try {
    const userRole = await getUserRoleInChannel(requestingUserId, channelId);
    if (userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can assign roles.' });
    }

    const [result] = await db.query(
      'UPDATE channel_members SET role_id = ? WHERE channel_id = ? AND user_id = ?',
      [roleId, channelId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found in channel' });
    }

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
};

// Get all roles in a channel
const getRolesInChannel = async (req, res) => {
  const { channelId } = req.params;

  try {
    const [roles] = await db.query(
      'SELECT id, name, permissions FROM roles WHERE channel_id = ?',
      [channelId]
    );
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Update role permissions
const updateRolePermissions = async (req, res) => {
  const { channelId, roleId } = req.params;
  const { permissions } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized user' });
  }

  try {
    const userRole = await getUserRoleInChannel(userId, channelId);
    if (userRole !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can update role permissions.' });
    }

    const [result] = await db.query(
      'UPDATE roles SET permissions = ? WHERE id = ? AND channel_id = ?',
      [JSON.stringify(permissions), roleId, channelId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};

module.exports = {
  createRole,
  assignRole,
  getRolesInChannel,
  updateRolePermissions,
};
