// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import HomePage from './components/HomePage';
import CreateWorkRoom from './components/CreateWorkRoom';
import GoogleSuccess from './components/GoogleSuccess';
import WorkroomLayout from './components/chatbox/WorkroomLayout';

import { UserProvider } from './UserContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <UserProvider token={token}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginForm setToken={setToken} />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create-workroom" element={<CreateWorkRoom />} />
          <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
          <Route path="/workroom/:channelId" element={<WorkroomLayout />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
