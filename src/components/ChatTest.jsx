import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatTest = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [typingUser, setTypingUser] = useState('');

  const channelId = "general";
  const username = "Gloria";

  useEffect(() => {
    socket.emit('joinChannel', channelId);

    socket.on('receiveMessage', (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on('typing', (username) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(''), 2000);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
    };
  }, [channelId]);

  const sendMessage = () => {
    const newMessage = {
      sender: username,
      text: message,
      timestamp: new Date().toISOString(),
    };
    socket.emit('sendMessage', { channelId, message: newMessage });
    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', { channelId, username });
  };

  return (
    <div>
      <h2>Channel: {channelId}</h2>
      {chat.map((msg, i) => (
        <p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>
      ))}
      {typingUser && <p>{typingUser} is typing...</p>}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatTest;
