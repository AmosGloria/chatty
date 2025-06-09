import React, { useEffect, useState } from 'react';

const GoogleSuccess = ({ setToken }) => {
  const [status, setStatus] = useState('Logging in...');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.removeItem('googleLoginInProgress'); // Clear the flag
      window.location.href = window.location.origin + '/home';
    } else {
      setStatus('Missing token. Redirecting to login...');
      setProcessing(false);
      setTimeout(() => {
        localStorage.removeItem('googleLoginInProgress'); // Clear the flag
        window.location.href = window.location.origin + '/login';
      }, 1000);
    }
  }, [setToken]);

  // Always block rendering while processing
  if (processing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">{status}</h1>
      </div>
    );
  }

  return null;
};

export default GoogleSuccess;
