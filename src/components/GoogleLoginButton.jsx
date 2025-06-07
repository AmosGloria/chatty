import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'; 
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 mt-4 bg-blue-600 text-white py-3 rounded
       hover:bg-blue-700 transition hover:cursor-pointer">
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
