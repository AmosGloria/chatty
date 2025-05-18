// UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children, token }) => {
  const [user, setUser] = useState({
    name: '',
    profileImage: '',
    status: '',
  });

  useEffect(() => {
    if (!token) {
      setUser({ name: '', profileImage: '', status: '' });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: res.data.username || '',
          status: res.data.status || '',
          profileImage: res.data.profile_picture
            ? res.data.profile_picture.startsWith('http')
              ? res.data.profile_picture
              : `http://localhost:5000${res.data.profile_picture}`
            : '',
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setUser({ name: '', profileImage: '', status: '' }); // Clear user on failure
      }
    };

    fetchUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
