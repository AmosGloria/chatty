import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Sidebar from './SideBar';
import UsersMessage from './UsersMessage';
import MessageBox from './MessageBox';
import SearchButton from './SearchButton';

const socket = io('http://localhost:5000'); // Backend URL

const WorkroomPage = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({ username: 'You', profileImage: '/images/gloria.jpg' }); // Temporary — replace with real user auth

  useEffect(() => {
    if (!channelId) return; // Prevent calls with undefined ID

    // const fetchChannelDetails = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const res = await axios.get(`http://localhost:5000/api/channels/${channelId}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setChannel(res.data);
    //   } catch (err) {
    //     console.error('Failed to fetch channel details:', err);
    //   }
    // };

    // const fetchMessages = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setMessages(res.data);
    //   } catch (err) {
    //     console.error('Failed to fetch messages:', err);
    //   }
    // };

    // fetchChannelDetails();
    // fetchMessages();

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
    width: '1440px',
    height: '1198px',
    top: '-599px',
    left: '793px',
    background: '#F8F8FF',
  }}
>

      {/* Sidebar on the left */}
      <Sidebar />
      <SearchButton/>
      <UsersMessage/>

      {/* Main chat content on the right */}
      <div className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-2">{channel?.name}</h2>
        <p className="text-gray-600 mb-4">{channel?.description}</p>

        <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default WorkroomPage;
