import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import HomePage from './components/HomePage';
import CreateWorkRoom from './components/CreateWorkRoom';
import GoogleSuccess from './components/chatbox/GoogleSuccess';
import WorkroomLayout from './components/chatbox/WorkroomLayout';
import { UserProvider } from './UserContext';


function AppRoutes({ token, setToken }) {
  const location = useLocation();
  const isGoogleSuccess = location.pathname === '/google-success';
  const googleLoginInProgress = localStorage.getItem('googleLoginInProgress') === 'true';

  // If Google login is in progress, only render GoogleSuccess route
  if (googleLoginInProgress || isGoogleSuccess) {
    return (
      <Routes>
        <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
        <Route path="*" element={<Navigate to="/google-success" replace />} />
      </Routes>
    );
  }

  // Only render protected routes if token exists and not on /google-success
  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm setToken={setToken} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm setToken={setToken} />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/create-workroom" element={<CreateWorkRoom />} />
      <Route path="/workroom/:channelId" element={<WorkroomLayout />} />
      {/* Removed /invite-response route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  // Initialize token from localStorage to avoid flash
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><h1>Loading...</h1></div>;
  }

  return (
    <UserProvider token={token}>
      <Router>
        <AppRoutes token={token} setToken={setToken} />
      </Router>
    </UserProvider>
  );
}

export default App;
