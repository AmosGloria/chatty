import React, { useState } from 'react';

const ProfileBox = ({ initialUser = { name: 'John Doe', status: 'Online' } }) => {
  const [user, setUser] = useState({ ...initialUser, image: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const handleImageRemove = () => {
    setUser((prev) => ({ ...prev, image: '' }));
  };

  return (
    <div style={{
      width: '324px',
      height: '100px',
      borderRadius: '10px',
      border: '1.23px solid #E8EFF7',
      background: '#BFC0CB',
      padding: '12.3px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12.3px',
      position: 'relative',
    }}>
      {/* Profile Picture Box */}
      <label htmlFor="profileUpload" style={{
        width: '40.37px',
        height: '40.37px',
        borderRadius: '8.2px',
        background: user.image ? 'transparent' : '#FFA78D',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {user.image ? (
          <>
            <img
              src={user.image}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
           
          </>
        ) : (
          <span style={{ fontSize: '12px', color: '#fff' }}>Add</span>
        )}
        <input
          id="profileUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </label>

      {/* Username and Status */}
      <div style={{
        width: '198.49px',
        height: '46.76px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <span style={{ fontWeight: '600', fontSize: '14px', color: '#1C1C1E' }}>{user.name}</span>
        <span style={{ fontSize: '12px', color: '#3C3C43' }}>{user.status}</span>
      </div>

      <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageRemove();
              }}
              style={{
                position: 'absolute',
                bottom: '7px',
                left: '70px',
                background: 'red',
                color: 'white',
                borderRadius: '20%',
                width: '75px',
                height: '16px',
                fontSize: '10px',
                cursor: 'pointer',
                border:'none',
              }}
              title="Remove"
            >
              Remove Picture
            </button>
    </div>
  );
};

export default ProfileBox;
