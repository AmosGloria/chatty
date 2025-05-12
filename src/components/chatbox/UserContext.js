// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a Context for User
const UserContext = createContext();

// UserProvider component to provide user state
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user data from the backend or local storage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);  // Assuming the backend sends user data
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use currentUser
export const useCurrentUser = () => {
  return useContext(UserContext);
};
