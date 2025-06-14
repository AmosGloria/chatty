import React, { useState } from 'react';
import axios from 'axios';

const InvitePeopleBox = ({ channelId, token: propToken }) => {
  const [isOpen, setIsOpen] = useState(false);   // Control visibility
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [reason, setReason] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Always get the latest token from localStorage if not passed as prop
  const token = propToken || localStorage.getItem('token');

  const handleSendInvite = async () => {
    if (!token) {
      setStatusMessage('You must be logged in to invite users.');
      return;
    }
    if (!channelId) {
      setStatusMessage('Cannot send invite: No channel selected.');
      return;
    }
    if (!email) {
      setStatusMessage('Please enter an email address');
      return;
    }
    console.log('Invite token being sent:', token); // Debug log
    try {
      const response = await axios.post(
        `http://localhost:5000/api/invitations/invite`,
        { email, role, reason, channelId }, // Pass channelId in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatusMessage(response.data.message || 'Invitation sent successfully');
      setEmail('');
      setReason('');
      setRole('Member');
    } catch (error) {
      console.error('Error sending invitation:', error.response?.data || error.message);
      setStatusMessage('Failed to send invitation');
    }
  };

  return (
    <div style={{ width: '340px', 
       marginBottom: '10px',
    }}>
      {(!channelId) && (
        <div style={{ color: 'red', fontWeight: 600, marginBottom: 8 }}>
          No channel selected. Please select a workroom to invite people.
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
        width: '324px',
           height: '76px',
          padding: '8px',
          borderRadius: '6px',
          background: '#F8FAFA',
          color: 'black',
          fontWeight: '600',
          border: '0.5px solid #DDDDDD',
          textAlign: 'left', 
          cursor: 'pointer',
          marginBottom: isOpen ? '12px' : '0',
        }}
        disabled={!channelId}
      >
        {isOpen ? 'Close Invite Panel' : 'Invite People'}
      </button>

      {isOpen && (
        <div
          style={{
            borderRadius: '6px',
            border: '0.5px solid #DDDDDD',
            background: '#F8FAFA',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          >
            <option value="Member">Member</option>
            <option value="Guest">Guest</option>
          </select>

          <textarea
            placeholder="Reason for invitation (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleSendInvite}
            style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send Request
          </button>

          {statusMessage && (
            <p
              style={{
                marginTop: '8px',
                fontSize: '14px',
                color: statusMessage.includes('Failed') ? 'red' : 'green',
                textAlign: 'center',
              }}
            >
              {statusMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InvitePeopleBox;
