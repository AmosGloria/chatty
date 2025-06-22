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

    // Send invite email to the invited user immediately (no admin approval required)
    const registrationLink = `http://localhost:5173/signup?email=${encodeURIComponent(email)}&token=${inviteId}&channelId=${channelId}`;
    await sendEmail(
      email,
      'You have been invited to join Chatty!',
      `Hello,\n\nYou have been invited to join a channel in Chatty. Please register using this link: ${registrationLink}\n\nIf you did not expect this invitation, you can ignore this email.`
    );

    res.status(201).json({ message: 'Invitation sent to user', inviteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
}

// 2. Invited user accepts or declines invitation
async function respondToInvitation(req, res) {
  try {
    const userId = req.user.userId;
    const { inviteId } = req.params;
    const { accept } = req.body; // true or false

    const invite = await invitationModel.getInvitationById(inviteId);
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    // if (!invite.admin_approved) return res.status(400).json({ error: 'Invitation not yet approved by admin' });

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
  respondToInvitation,
};
