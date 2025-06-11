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
    const { email, channelId } = req.body;

    // Look up invited user by email
    const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    let invitedUserId = null;
    let isNewUser = false;
    if (user.length) {
      invitedUserId = user[0].id;
    } else {
      isNewUser = true;
    }

    // Create invite record (invitedUserId may be null for new users)
    const inviteId = await invitationModel.createInvitation(inviterUserId, invitedUserId, channelId);

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
        `Hello ${admin.name},\n\nUser with ID ${inviterUserId} has invited ${email} to join your channel (ID: ${channelId}). Please approve or decline the invitation in the admin panel.`
      );
    }

    // If new user, send registration link
    if (isNewUser) {
      const registrationLink = `http://localhost:3000/signup?invite=${inviteId}&email=${encodeURIComponent(email)}`;
      const acceptLink = `http://localhost:3000/invite-response?invite=${inviteId}&action=accept`;
      const declineLink = `http://localhost:3000/invite-response?invite=${inviteId}&action=decline`;
      await sendEmail(
        email,
        'You have been invited to join Chatty!',
        `Hello,\n\nYou have been invited to join a channel in Chatty. Please register using this link: ${registrationLink}\n\n` +
        `Or respond directly:\nAccept: ${acceptLink}\nDecline: ${declineLink}`
      );
    }

    res.status(201).json({ message: isNewUser ? 'Invitation sent to new user (registration required)' : 'Invitation sent and awaiting admin approval', inviteId });
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
    if (!invite.admin_approved) return res.status(400).json({ error: 'Invitation not yet approved by admin' });

    // If this invitation was for a new user, update the invitation with the new userId
    if (!invite.invited_user_id) {
      await invitationModel.setInvitedUserId(inviteId, userId);
    } else if (invite.invited_user_id !== userId) {
      return res.status(403).json({ error: 'Not your invitation' });
    }

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
