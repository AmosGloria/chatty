import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true }); // Navigate to LoginForm
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        cursor: 'pointer',
        padding: '1px 6px',
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontWeight: 'bold',
         height: 50,
        
      }}
      aria-label="Logout"
      title="Logout"
    >
      Logout
    </button>
  );
};

export default Logout;
