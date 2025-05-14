import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import FetchMessage from './FetchMessage';
import MessageBox from './MessageBox';
import SearchButton from './SearchButton';

const socket = io('http://localhost:5000'); // Backend URL

const WorkroomPage = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({ username: 'You', profileImage: '/images/gloria.jpg' }); 

  useEffect(() => {
    if (!channelId) return;

    socket.emit('joinChannel', channelId);

    socket.on('receiveMessage', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, [channelId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#F8F8FF',
      }}
    >
      {/* Optional search and user section */}
      <div style={{ padding: '16px' }}>
        <SearchButton />
         <FetchMessage channelId={channelId} user={user} messages={messages} />
      </div>

      {/* Main content with scrollable area */}
      <div
        style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: 'auto',
        }}
      >
        <div style={{ paddingBottom: '140px' /* reserve space for fixed MessageBox */ }}>
          <h2 className="text-2xl font-bold mb-2">{channel?.name}</h2>
          <p className="text-gray-600 mb-4">{channel?.description}</p>

          {/* Messages could be mapped here if needed */}
        </div>
      </div>

      {/* Fixed MessageBox at bottom */}
      <MessageBox
        user={user}
        channelId={channelId}
        onSend={(text) => {
          socket.emit('sendMessage', {
            channelId,
            message: {
              content: text,
              username: user.username,
              profileImage: user.profileImage,
            },
          });
        }}
      />
    </div>
  );
};

export default WorkroomPage;
