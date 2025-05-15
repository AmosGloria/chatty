import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamBox = ({ channelId }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!channelId || !token) return;

    const fetchTeams = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/teams/channel/${channelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeams(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedTeam(response.data[0].name); // default select first team
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setFeedback('Failed to fetch teams.');
      }
    };

    fetchTeams();
  }, [channelId, token]);

  const handleCreateTeam = async () => {
    if (!teamName) {
      setFeedback('Please provide a team name.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/teams',
        {
          name: teamName,
          isPrivate,
          channelId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setFeedback('Team created successfully!');
        const newTeam = { name: response.data.teamName || teamName };
        setTeams((prev) => [...prev, newTeam]);
        setSelectedTeam(newTeam.name);
        setTeamName('');
        setIsPrivate(false);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setFeedback('Team creation failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        width: '324px',
        borderRadius: '6px',
        border: '0.5px solid #DDDDDD',
        background: '#F8FAFA',
        padding: '16px',
        marginBottom: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: '12px',
        }}
        onClick={() => setShowOptions(!showOptions)}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#ccc',
            borderRadius: '4px',
            marginRight: '12px',
          }}
        />
        <span style={{ fontWeight: '500' }}>Teams</span>
      </div>

      {showOptions && (
        <div>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Private Team
          </label>

          <button
            onClick={handleCreateTeam}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            Create Team
          </button>

          {feedback && (
            <p style={{ marginTop: '12px', color: '#FF0000' }}>{feedback}</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        {teams.length > 0 ? (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          >
            {teams.map((team, index) => (
              <option key={index} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        ) : (
          <p>No teams available in this channel.</p>
        )}
      </div>
    </div>
  );
};

export default TeamBox;
