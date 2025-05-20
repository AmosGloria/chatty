const nodemailer = require('nodemailer');
const invitationModel = require('../models/invitationModel');
const db = require('../connectDatabase');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Gmail
    pass: process.env.SMTP_PASS, // app password
  },
});

// Send email helper
async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

// 1. User sends invite request
async function sendInvitation(req, res) {
  try {
    const inviterUserId = req.user.userId;
    const { invitedUserId, channelId } = req.body;

    // Basic validations omitted for brevity (check channel existence, etc.)

    // Create invite record
    const inviteId = await invitationModel.createInvitation(inviterUserId, invitedUserId, channelId);

    // Notify channel admin (creator) via email that an invite awaits approval
    // Fetch channel creator email
    const [channel] = await db.query('SELECT created_by FROM channels WHERE id = ?', [channelId]);
    if (!channel.length) return res.status(400).json({ error: 'Channel not found' });

    const creatorId = channel[0].created_by;

    const [adminUser] = await db.query('SELECT email, name FROM users WHERE id = ?', [creatorId]);
    if (adminUser.length) {
      const admin = adminUser[0];
      await sendEmail(
        admin.email,
        'New Channel Invitation Pending Approval',
        `Hello ${admin.name},\n\nUser with ID ${inviterUserId} has invited user ID ${invitedUserId} to join your channel (ID: ${channelId}). Please approve or decline the invitation in the admin panel.`
      );
    }

    res.status(201).json({ message: 'Invitation sent and awaiting admin approval', inviteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
}

// 2. Admin views pending invitations for their channels
async function getPendingInvitations(req, res) {
  try {
    const adminUserId = req.user.userId;
    const invites = await invitationModel.getPendingInvitationsForAdmin(adminUserId);
    res.status(200).json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending invitations' });
  }
}

// 3. Admin approves or declines invitation
async function handleAdminApproval(req, res) {
  try {
    const adminUserId = req.user.userId;
    const { inviteId } = req.params;
    const { approve } = req.body; // true or false

    // Verify admin owns the channel linked to invite
    const invite = await invitationModel.getInvitationById(inviteId);
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });

    const [channel] = await db.query('SELECT created_by FROM channels WHERE id = ?', [invite.channel_id]);
    if (!channel.length || channel[0].created_by !== adminUserId) {
      return res.status(403).json({ error: 'You are not authorized to approve this invite' });
    }

    // Update approval status
    await invitationModel.updateAdminApproval(inviteId, approve);

    // Notify inviter/admin that invite was approved/declined (optional)
    // Notify invited user if approved
    if (approve) {
      const [invitedUser] = await db.query('SELECT email, name FROM users WHERE id = ?', [invite.invited_user_id]);
      if (invitedUser.length) {
        const user = invitedUser[0];
        await sendEmail(
          user.email,
          'Invitation Approved - Please Respond',
          `Hello ${user.name},\n\nYour invitation to join channel ID ${invite.channel_id} has been approved by the admin.\nPlease accept or decline the invitation by visiting the app.`
        );
      }
    }

    res.status(200).json({ message: `Invitation ${approve ? 'approved' : 'declined'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process admin approval' });
  }
}

// 4. Invited user accepts or declines invitation
async function respondToInvitation(req, res) {
  try {
    const userId = req.user.userId;
    const { inviteId } = req.params;
    const { accept } = req.body; // true or false

    const invite = await invitationModel.getInvitationById(inviteId);
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    if (invite.invited_user_id !== userId) return res.status(403).json({ error: 'Not your invitation' });
    if (!invite.admin_approved) return res.status(400).json({ error: 'Invitation not yet approved by admin' });

    // Update user response
    await invitationModel.updateUserResponse(inviteId, accept);

    if (accept) {
      // Add user to channel_members as 'Member'
      await db.query(
        'INSERT INTO channel_members (channel_id, user_id, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [invite.channel_id, userId, 'Member']
      );
    }

    res.status(200).json({ message: `Invitation ${accept ? 'accepted' : 'declined'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
}

module.exports = {
  sendInvitation,
  getPendingInvitations,
  handleAdminApproval,
  respondToInvitation,
};
