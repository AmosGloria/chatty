import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InviteResponse = () => {
  const [message, setMessage] = useState('Processing...');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    const action = params.get('action');
    const email = params.get('email');
    if (!inviteId || !['accept', 'decline'].includes(action)) {
      setMessage('Invalid invitation link.');
      return;
    }
    // If not logged in, redirect to signup/login with invite info
    const token = localStorage.getItem('token');
    if (!token) {
      // Save invite info in localStorage for after signup/login
      localStorage.setItem('pendingInviteId', inviteId);
      localStorage.setItem('pendingInviteAction', action);
      if (email) localStorage.setItem('pendingInviteEmail', email);
      // Always show a choice: sign up or log in
      window.location.href = `/invite-auth-choice?invite=${inviteId}&action=${action}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
      return;
    }
    // If logged in, process the invite
    axios.patch(`http://localhost:5000/api/invitations/respond/${inviteId}`, { accept: action === 'accept' }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMessage(res.data.message || 'Response recorded.'))
      .catch(() => setMessage('Failed to process your response.'));
  }, []);
  return <div style={{ padding: 40, textAlign: 'center' }}><h2>{message}</h2></div>;
};

export default InviteResponse;
