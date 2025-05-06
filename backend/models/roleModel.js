// models/roleModel.js
const db = require('../connectDatabase');

const createRole = async (channelId, name, permissions) => {
  const [result] = await db.query(
    'INSERT INTO roles (channel_id, name, permissions) VALUES (?, ?, ?)',
    [channelId, name, JSON.stringify(permissions)]
  );
  return result;
};

const assignRoleToUser = async (channelId, userId, roleId) => {
  const [adminCheck] = await db.query(
    'SELECT role FROM channel_members WHERE channel_id = ? AND user_id = ?',
    [channelId, userId]
  );
  if (!adminCheck.length || adminCheck[0].role !== 'Admin') {
    throw new Error('Only admins can assign roles.');
  }
  const [result] = await db.query(
    'UPDATE channel_members SET role_id = ? WHERE channel_id = ? AND user_id = ?',
    [roleId, channelId, userId]
  );
  return result;
};

const getRoles = async (channelId) => {
  const [rows] = await db.query(
    'SELECT * FROM roles WHERE channel_id = ?',
    [channelId]
  );
  return rows;
};

module.exports = { createRole, assignRoleToUser, getRoles };
