import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation in react-router-dom v6

const ChannelList = () => {
  const [channels, setChannels] = useState([]);  // To store channels
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // To show loading state

  const navigate = useNavigate();  // Use navigate to redirect

  // Fetch channels for the logged-in user
  const fetchChannels = async () => {
    setIsLoading(true);  // Start loading when fetching
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
        setChannels(data);  // Set fetched channels
      } else {
        setError('Failed to fetch channels');
      }
    } catch (err) {
      setError('Something went wrong while fetching channels');
    } finally {
      setIsLoading(false);  // Stop loading after fetching
    }
  };

  // Run this on component mount
  useEffect(() => {
    fetchChannels();
  }, []);  // Empty dependency array means this runs only once on mount

  // Handle workroom click and redirect to ChatBox
  const handleChannelClick = (channelId) => {
    navigate(`/workroom/${channelId}`);  // Navigate to the workroom's chat page
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-lg font-semibold text-gray-900">Your Workrooms</h3>

      {/* Display loading state */}
      {isLoading && <p className="text-sm text-gray-500">Loading channels...</p>}

      {/* Display channels */}
      <ul className="mt-4 space-y-2">
        {channels.length === 0 ? (
          <li className="text-gray-500">No Workrooms available.</li>
        ) : (
          channels.map((channel) => (
            <li 
              key={channel.id} 
              className="flex justify-between items-center px-4 py-2 border border-gray-200 rounded-md cursor-pointer"
              onClick={() => handleChannelClick(channel.id)} // Trigger on click to navigate
            >
              <span className="font-medium">{channel.name}</span>
              <span className="text-sm text-gray-500">{channel.membersCount} Members</span>
            </li>
          ))
        )}
      </ul>

      {/* Display error message if it exists */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default ChannelList;