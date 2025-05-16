import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../UserContext';

const ProfileBox = () => {
  const { user, setUser } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef(null);
  const token = localStorage.getItem('token');
  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsEditing(false);
        setSelectedFile(null);
        setFeedback('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFeedback('');
    }
  };

  const handleImageRemove = () => {
    setUser((prev) => ({ ...prev, profileImage: '' }));
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const res = await axios.post(`${backendUrl}/api/auth/profile/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.profile_picture;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFeedback('');
    try {
      let profile_picture = user.profileImage;

      if (selectedFile) {
        profile_picture = await uploadImage(selectedFile);
        // Compose full URL if backend returns relative path
        profile_picture = profile_picture.startsWith('http')
          ? profile_picture
          : `${backendUrl}${profile_picture}`;
      }

      const updatePayload = {
        username: user.name,
        status: user.status,
        profile_picture,
      };

      await axios.put(`${backendUrl}/api/auth/profile`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => ({
        ...prev,
        profileImage: profile_picture,
        name: user.name,
        status: user.status,
      }));

      setSelectedFile(null);
      setFeedback('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setFeedback('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '324px',
        height: '76px',
        borderRadius: '10px',
        border: '0.5px solid #DDDDDD',
        background: '#F8FAFA',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        cursor: isEditing ? 'auto' : 'pointer',
      }}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label
          htmlFor="profileUpload"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: user.profileImage ? 'transparent' : '#FFA78D',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <input
            id="profileUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          {selectedFile ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontSize: '36px',
                color: '#555',
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              {user.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </label>

        <input
          name="name"
          value={user.name}
          onChange={handleChange}
          placeholder="Username"
          disabled={loading}
          style={{
            flexGrow: 1,
            padding: '8px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: isEditing ? 'text' : 'default',
            backgroundColor: isEditing ? 'white' : 'transparent',
          }}
          readOnly={!isEditing}
        />
      </div>

      {isEditing && (
        <>
          {user.profileImage && !selectedFile && (
            <button
              onClick={handleImageRemove}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#FF6B6B',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
              disabled={loading}
            >
              Remove Picture
            </button>
          )}

          <input
            name="status"
            value={user.status}
            onChange={handleChange}
            placeholder="Status"
            disabled={loading}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '12px',
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </>
      )}

      {feedback && (
        <p
          style={{
            marginTop: '12px',
            color: feedback.includes('Failed') ? 'red' : 'green',
            textAlign: 'center',
          }}
        >
          {feedback}
        </p>
      )}
    </div>
  );
};

export default ProfileBox;
