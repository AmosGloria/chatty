import React from 'react';
import TeamBox from './TeamBox';
import DirectMessagesBox from './DirectMessagesBox';
import MeBox from './MeBox';
import InvitePeopleBox from './InvitePeopleBox';
import ProfileBox from './ProfileBox';

const Sidebar = () => {
  return (
    <div style={{
      width: '400px',
      height: '1114px',
      borderRadius: '16px',
      border: '3px solid #EAEAEE',
      background: '#FFFFFF',
      boxShadow: '0px 4px 6px 0px #0F0B0B1A',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <TeamBox />
      <DirectMessagesBox />
      <MeBox />
      <InvitePeopleBox />
      <ProfileBox initialUser={{ name: 'Jane Smith', status: 'Available' }} />

    </div>
  );
};

export default Sidebar;
