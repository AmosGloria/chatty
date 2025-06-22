import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    const urlToken = params.get('token');
    const urlChannelId = params.get('channelId');
    if (urlEmail && urlToken) {
      setEmail(urlEmail);
      setEmailLocked(true);
      setInviteToken(urlToken);
      localStorage.setItem('pendingInviteToken', urlToken);
      localStorage.setItem('pendingInviteEmail', urlEmail);
      if (urlChannelId) localStorage.setItem('pendingInviteChannelId', urlChannelId);
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password };
      if (inviteToken) payload.inviteToken = inviteToken;
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const channelId = localStorage.getItem('pendingInviteChannelId');
        if (channelId) {
          localStorage.removeItem('pendingInviteChannelId');
          navigate(`/workroom/${channelId}`);
        } else {
          alert('Signup successful! Please log in.');
          navigate('/login?email=' + encodeURIComponent(email) + (inviteToken ? ('&token=' + encodeURIComponent(inviteToken)) : ''));
        }
      } else {
        const errorData = await response.text(); 
        setError(errorData);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleGoToLogin = (e) => {
    e.preventDefault();
    const channelId = localStorage.getItem('pendingInviteChannelId');
    let url = '/login?email=' + encodeURIComponent(email) + (inviteToken ? ('&token=' + encodeURIComponent(inviteToken)) : '');
    if (channelId) url += `&channelId=${channelId}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
          readOnly={emailLocked}
          style={emailLocked ? { backgroundColor: '#f3f3f3', color: '#888' } : {}}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition hover:cursor-pointer">
          Sign Up
        </button>
        <div className="mt-4 text-center">
          <button onClick={handleGoToLogin} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer" type="button">
            Already have an account? Log in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
