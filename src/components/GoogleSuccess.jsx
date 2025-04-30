import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleSuccess = ({ setToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
      localStorage.setItem('token', token);  // Optional: Save permanently
      navigate('/home');
    }
  }, [setToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Logging you in with Google...</h1>
    </div>
  );
};

export default GoogleSuccess;
