import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Connect to the backend WebSocket server
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
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming JWT token is stored in localStorage
          },
        });

        // Flatten the response data if it's an array of arrays
        const flattenedMessages = response.data.flat(); // This will flatten any nested arrays
        console.log("Fetched messages:", flattenedMessages);  // Log the response data
        setMessages(flattenedMessages);  // Set fetched messages into state
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (channelId) {
      fetchMessages(); // Fetch messages for the given channelId
      socket.emit('joinChannel', channelId); // Notify server that the user joined the channel
    }

    // Listen for new messages via socket.io
    socket.on('receiveMessage', (newMessage) => {
      console.log('Received new message:', newMessage); // Log received message
      setMessages((prev) => [...prev, newMessage]); // Add the new message to the messages array
    });

    // Cleanup the socket listener on component unmount
    return () => {
      socket.off('receiveMessage');
    };
  }, [channelId]); // Dependency on channelId ensures fetching and socket events are triggered on channel change

  return (
    <div
      style={{
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#EEE',
                flexShrink: 0,
              }}
            >
              {msg.user_profile_image ? (
                <img
                  src={msg.user_profile_image}
                  alt={msg.user_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#555',
                  }}
                >
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
