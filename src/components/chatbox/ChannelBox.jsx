import React from 'react';

const ChannelBox = () => {
  return (
    <div style={{
      width: '324px',
      height: '76px',
      borderRadius: '6px',
      border: '2px solid #BFC0CB',
      background: '#F8FAFA',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
    }}>
      <div style={{
        width: '30px',
        height: '30px',
        backgroundColor: '#ccc',
        borderRadius: '4px',
        marginRight: '12px',
      }}>
        {/* Icon placeholder: Add Square */}
      </div>
      <span style={{ fontWeight: '500' }}>Channels</span>
    </div>
  );
};

export default ChannelBox;
