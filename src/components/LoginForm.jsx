import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = ({ setToken }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);                         
        localStorage.setItem('token', data.token);    
        navigate('/home'); 
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
          <a href="/signup" className="text-blue-600 hover:underline">Don't have an account? Sign up</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
