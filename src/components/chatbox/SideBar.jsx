import React, { useState } from 'react';
import TeamBox from './TeamBox';
import DirectMessagesBox from './DirectMessagesBox';
import ThreadsBox from './ThreadsBox';
import InvitePeopleBox from './InvitePeopleBox';
import ProfileBox from './ProfileBox';

const Sidebar = ({ selectedChannelId }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        width: '400px',
        height: '100vh',
        borderRadius: '16px',
        border: '3px solid #EAEAEE',
        background: '#FFFFFF',
        boxShadow: '0px 4px 6px 0px #0F0B0B1A',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        scrollbarWidth: isHovered ? 'thin' : 'none',
        msOverflowStyle: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>
        {`
          ::-webkit-scrollbar {
            width: ${isHovered ? '6px' : '0px'};
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
          }
        `}
      </style>

      <div
        style={{
          maxHeight: '250px', // limit the TeamBox height
          overflowY: 'auto',
          marginBottom: '12px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`
            ::-webkit-scrollbar {
              width: 0;
            }
          `}
        </style>
        <TeamBox channelId={selectedChannelId} />
      </div>

      <DirectMessagesBox />
      <ThreadsBox />
      <InvitePeopleBox channelId={selectedChannelId} />
      <ProfileBox initialUser={{ name: 'Jane Smith', status: 'Available' }} />
    </div>
  );
};

export default Sidebar;
