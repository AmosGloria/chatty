import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import MessagesResponse from './MessagesResponse'; // Your messages UI component

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket'],
});

const FetchMessage = ({ channelId, user }) => {
  const [messages, setMessages] = useState([]);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(response.data.flat());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    fetchMessages();

    socket.emit('joinChannel', channelId);

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [channelId, fetchMessages]);

  // Delete message handler
  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Could not delete message. You might not have permission.');
    }
  };

  // Stub handlers for other actions (replace with your logic)
  const handleReply = (msg) => {
    console.log('Reply to:', msg);
  };
  const handleReact = (msgId, emoji) => {
    console.log(`React to message ${msgId} with emoji ${emoji}`);
  };
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };
  const handleInfo = (msg) => {
    alert(`Message from ${msg.user_name} sent at ${new Date(msg.created_at).toLocaleString()}`);
  };
  const handleSelect = (msgId) => {
    console.log('Select message:', msgId);
  };
  const handleForward = (msg) => {
    console.log('Forward message:', msg);
  };

  return (
    <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
      {messages.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No messages yet</p>
      ) : (
        <MessagesResponse
          messages={messages}
          user={user}
          onDelete={handleDelete}
          onReply={handleReply}
          onReact={handleReact}
          onCopy={handleCopy}
          onInfo={handleInfo}
          onSelect={handleSelect}
          onForward={handleForward}
        />
      )}
    </div>
  );
};

export default FetchMessage;
