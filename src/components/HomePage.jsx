import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import ChannelList from './ChannelList';      // Import ChannelList component

const HomePage = () => {
  const [token, setToken] = useState(null);  // Manage token state
  const [error, setError] = useState('');    // Error handling state
  const [channels, setChannels] = useState([]); // Store channels

  const navigate = useNavigate();  // Initialize useNavigate

  // Check if the user is authenticated by checking the token
  const isAuthenticated = token || localStorage.getItem('token');

  // Fetch channels for the logged-in user
  const fetchChannels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/channels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,  // Add token from localStorage
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChannels(data);  // Update state with fetched channels
      } else {
        setError('Failed to fetch channels');
      }
    } catch (err) {
      setError('Something went wrong while fetching channels');
    }
  };

  // Run this on component mount to fetch channels
  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();  // Fetch channels if authenticated
    }
  }, [isAuthenticated]);

  // Redirect to the Create Workroom page
  const handleCreateWorkroomClick = () => {
    navigate('/create-workroom'); // Navigate to the /create-workroom route
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to Chatty! Good to have you here.</h1>

        {/* Conditionally render components based on authentication */}
        {isAuthenticated ? (
          <div>
            {/* Show "Create Workroom" button, and navigate to CreateWorkroom page on click */}
            <button
              onClick={handleCreateWorkroomClick}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Create Workroom
            </button>

            {/* Optionally, render the channel list */}
            <ChannelList channels={channels} />
          </div>
        ) : (
          <div>Please log in to access the app.</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
