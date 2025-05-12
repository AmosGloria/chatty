// WorkroomLayout.jsx
import React from 'react';
import Sidebar from './SideBar';
import WorkroomPage from './WorkRoomPage';
import { useParams } from 'react-router-dom';

const WorkroomLayout = () => {
  const { channelId } = useParams();

  return (
  <div
  style={{
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: '#F8F8FF', // solid color to cover bleed
  }}
>
      <Sidebar selectedChannelId={channelId} />
      <WorkroomPage />
    </div>
  );
};

export default WorkroomLayout;
