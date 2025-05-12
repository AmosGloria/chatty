import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket'],
});

const FetchMessage = ({ channelId, user }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${channelId}/messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (channelId) {
      fetchMessages();
      socket.emit('joinChannel', channelId);
    }

    // ✅ Listen for new messages
    socket.on('receiveMessage', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // 🧹 Clean up listener when component unmounts
    return () => {
      socket.off('receiveMessage');
    };
  }, [channelId]);

  return (
    <div
      style={{
        width: '608px',
        top: '262px',
        left: '722px',
        position: 'absolute',
        borderRadius: '10px',
        background: '#FFFFFF',
        border: '1px solid #DDDDDD',
        boxShadow: `0px 1.02px 2.29px 0px #00000021, 0px 0.19px 0.57px 0px #0000001C`,
        padding: '46px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        maxHeight: '60vh',
      }}
    >
      {messages.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No messages yet</p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              alignSelf: msg.user_id === user.id ? 'flex-end' : 'flex-start',
              flexDirection: msg.user_id === user.id ? 'row-reverse' : 'row',
              maxWidth: '90%',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#EEE',
              flexShrink: 0
            }}>
              {msg.user_profile_image ? (
                <img
                  src={msg.user_profile_image}
                  alt={msg.user_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555'
                }}>
                  {msg.user_name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>

            <div
              style={{
                backgroundColor: msg.user_id === user.id ? '#DFF7E0' : '#F1F1F1',
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
                maxWidth: '100%',
              }}
            >
              <strong>{msg.user_name}</strong>
              <p style={{ marginTop: '4px' }}>{msg.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FetchMessage;
