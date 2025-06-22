import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = ({ setToken }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    const urlToken = params.get('token');
    const urlChannelId = params.get('channelId');
    if (urlEmail && urlToken) {
      setLoginEmail(urlEmail);
      setEmailLocked(true);
      setInviteToken(urlToken);
      localStorage.setItem('pendingInviteToken', urlToken);
      localStorage.setItem('pendingInviteEmail', urlEmail);
      if (urlChannelId) localStorage.setItem('pendingInviteChannelId', urlChannelId);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { email: loginEmail, password: loginPassword };
      if (inviteToken) payload.inviteToken = inviteToken;
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);                         
        localStorage.setItem('token', data.token);    
        const channelId = localStorage.getItem('pendingInviteChannelId');
        if (channelId) {
          localStorage.removeItem('pendingInviteChannelId');
          navigate(`/workroom/${channelId}`);
        } else {
          navigate('/home');
        }
      } else {
        const errorData = await response.text();         
        setError(errorData);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
          readOnly={emailLocked}
          style={emailLocked ? { backgroundColor: '#f3f3f3', color: '#888' } : {}}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition hover:cursor-pointer">
          Sign In
        </button>
        <div className="mt-4 text-center text-gray-500">or</div>
        <GoogleLoginButton />
        <div className="mt-4 text-center">
          <a href={inviteToken ? (`/signup?email=${encodeURIComponent(loginEmail)}&token=${encodeURIComponent(inviteToken)}`) : "/signup"} className="text-blue-600 hover:underline">Don't have an account? Sign up</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
