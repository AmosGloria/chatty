import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InviteResponse = () => {
  const [message, setMessage] = useState('Processing...');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    const action = params.get('action');
    if (!inviteId || !['accept', 'decline'].includes(action)) {
      setMessage('Invalid invitation link.');
      return;
    }
    // No auth required for new users, so use PATCH without token
    axios.patch(`http://localhost:5000/api/invitations/respond/${inviteId}`, { accept: action === 'accept' })
      .then(res => setMessage(res.data.message || 'Response recorded.'))
      .catch(() => setMessage('Failed to process your response.'));
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}><h2>{message}</h2></div>;
};

export default InviteResponse;
