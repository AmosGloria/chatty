import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ProfileBox = () => {
  const [user, setUser] = useState({
    id: null,
    name: '',
    status: '',
    profile_picture: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');
  const wrapperRef = useRef(null);

  // Backend base URL - adjust if needed
  const backendUrl = 'http://localhost:5000';

  // Fetch current profile info on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          id: res.data.id,
          name: res.data.username || '',
          status: res.data.status || '',
          profile_picture: res.data.profile_picture || null,
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Close edit mode if clicking outside the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsEditing(false);
        setSelectedFile(null); // discard any selected but not saved image
        setFeedback('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Handle image file selection
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFeedback('');
    }
  };

  // Remove profile picture
  const handleImageRemove = () => {
    setUser((prev) => ({ ...prev, profile_picture: null }));
    setSelectedFile(null);
  };

  // Handle text input changes for name and status
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Upload image file to backend
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const res = await axios.post(`${backendUrl}/api/auth/profile/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.profile_picture; // expect URL or filename returned
  };

  // Submit profile updates
  const handleSubmit = async () => {
    setLoading(true);
    setFeedback('');

    try {
      let profile_picture = user.profile_picture;

      if (selectedFile) {
        profile_picture = await uploadImage(selectedFile);
      }

      const updatePayload = {
        username: user.name,
        status: user.status,
        profile_picture,
      };

      await axios.put(`${backendUrl}/api/auth/profile`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => ({ ...prev, profile_picture }));
      setSelectedFile(null);
      setFeedback('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setFeedback('Failed to update profile');
    }

    setLoading(false);
  };

  // Prepare full image URL for display
  const profileImageUrl = user.profile_picture
    ? user.profile_picture.startsWith('http')
      ? user.profile_picture
      : `${backendUrl}${user.profile_picture}`
    : null;

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
      {/* Name and Profile Picture on the same line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label
          htmlFor="profileUpload"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: profileImageUrl ? 'transparent' : '#FFA78D',
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
          ) : profileImageUrl ? (
            <img
              src={profileImageUrl}
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

      {/* Conditionally render the editable fields only if editing */}
      {isEditing && (
        <>
          {profileImageUrl && !selectedFile && (
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

      {/* Feedback Message */}
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
