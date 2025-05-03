import React from 'react';

const MeBox = () => {
  return (
    <div style={{
      width: '324px',
      height: '76px',
      borderRadius: '6px',
      border: '0.5px solid #DDDDDD',
      background: '#F8FAFA',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
    }}>
      <span style={{ fontWeight: '500' }}>Me</span>
    </div>
  );
};

export default MeBox;
