const db = require('../connectDatabase');

// Create an invitation record
async function createInvitation(inviterUserId, invitedUserId, channelId) {
  // Defensive: log all values for debugging
  console.log('createInvitation called with:', { inviterUserId, invitedUserId, channelId });
  // If channelId is missing, throw an error
  if (!channelId) throw new Error('channelId is required');
  // If invitedUserId is undefined, set to null explicitly
  if (typeof invitedUserId === 'undefined') invitedUserId = null;
  const [result] = await db.query(
    `INSERT INTO channel_invitations 
      (inviter_user_id, invited_user_id, channel_id, status, admin_notified, admin_approved)
     VALUES (?, ?, ?, 'pending', false, false)`,
    [inviterUserId, invitedUserId, channelId]
  );
  return result.insertId;
}

// Get invitation by ID
async function getInvitationById(id) {
  const [rows] = await db.query('SELECT ci.*, u.email FROM channel_invitations ci LEFT JOIN users u ON ci.invited_user_id = u.id WHERE ci.id = ?', [id]);
  return rows[0];
}

// Get pending invitations for admin approval (admin is creator of channel)
async function getPendingInvitationsForAdmin(adminUserId) {
  const [rows] = await db.query(`
    SELECT ci.*, u1.name AS inviter_name, u2.name AS invited_name, c.name AS channel_name
    FROM channel_invitations ci
    JOIN channels c ON ci.channel_id = c.id
    JOIN users u1 ON ci.inviter_user_id = u1.id
    JOIN users u2 ON ci.invited_user_id = u2.id
    WHERE ci.status = 'pending' AND c.created_by = ?
  `, [adminUserId]);
  return rows;
}

// Approve or decline invitation by admin
async function updateAdminApproval(inviteId, approved) {
  const status = approved ? 'approved' : 'declined';
  const [result] = await db.query(`
    UPDATE channel_invitations 
    SET admin_approved = ?, admin_notified = true, status = ?
    WHERE id = ?`,
    [approved, status, inviteId]
  );
  return result.affectedRows;
}

// Update user response (accept or decline)
async function updateUserResponse(inviteId, accepted) {
  const status = accepted ? 'accepted' : 'declined';
  const [result] = await db.query(`
    UPDATE channel_invitations 
    SET status = ?
    WHERE id = ? AND admin_approved = true`,
    [status, inviteId]
  );
  return result.affectedRows;
}

// Mark admin notified (optional)
async function markAdminNotified(inviteId) {
  const [result] = await db.query(`
    UPDATE channel_invitations
    SET admin_notified = true
    WHERE id = ?`,
    [inviteId]
  );
  return result.affectedRows;
}

// Set invited_user_id for a pending invitation (for new users)
async function setInvitedUserId(inviteId, userId) {
  const [result] = await db.query(
    `UPDATE channel_invitations SET invited_user_id = ? WHERE id = ?`,
    [userId, inviteId]
  );
  return result.affectedRows;
}

module.exports = {
  createInvitation,
  getInvitationById,
  getPendingInvitationsForAdmin,
  updateAdminApproval,
  updateUserResponse,
  markAdminNotified,
  setInvitedUserId,
};
