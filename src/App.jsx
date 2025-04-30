// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import HomePage from './components/HomePage';
import CreateChannel from './components/CreateChannel';
import GoogleSuccess from './components/GoogleSuccess';
import ChatBox from './components/messages/ChatBox';

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm setToken={setToken} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/create-workroom" element={<CreateChannel />} />
        <Route path="/google-success" element={<GoogleSuccess setToken={setToken} />} />
        <Route path="/chatbox" element={<ChatBox />} />
      </Routes>
    </Router>
  );
}

export default App;
