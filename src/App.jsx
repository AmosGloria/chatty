// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import HomePage from './components/HomePage';
import CreateWorkRoom from './components/CreateWorkRoom';
import GoogleSuccess from './components/GoogleSuccess';
import WorkroomPage from './components/chatbox/WorkRoomPage';

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm setToken={setToken} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/create-workroom" element={<CreateWorkRoom />} />
        <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
        <Route path="/workroom/:channelId" element={<WorkroomPage />} />
      </Routes>
    </Router>
  );
}

export default App;