import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChatBox = () => {
  const { channelId } = useParams();  // Get the channelId from the URL
  const [channelDetails, setChannelDetails] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch channel details when the component mounts
  const fetchChannelDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/channels/${channelId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChannelDetails(data);  // Set channel details
      } else {
        setError('Failed to fetch channel details');
      }
    } catch (err) {
      setError('Something went wrong while fetching channel details');
    }
  };

  useEffect(() => {
    fetchChannelDetails();  // Fetch channel details on component mount
  }, [channelId]);

  return (
    <div className="chat-box-container">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {channelDetails ? (
        <div>
          <h2 className="text-2xl">{channelDetails.name}</h2>
          <p className="text-sm text-gray-500">{channelDetails.description}</p>
          <div className="invitation-code">
            <p className="text-sm text-gray-700">Join this workroom using this link:</p>
            <a href={channelDetails.invitationLink} className="text-blue-500">
              {channelDetails.invitationLink}
            </a>
          </div>
          {/* Add the chat messages and input fields here */}
        </div>
      ) : (
        <p>Loading channel details...</p>
      )}
    </div>
  );
};

export default ChatBox;
