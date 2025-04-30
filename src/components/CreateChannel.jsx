import React, { useState } from 'react';

const CreateChannel = ({ setError, fetchChannels }) => {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('team');  // Default to 'team'
  const [isPrivate, setIsPrivate] = useState(false);  // Default to public
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState('');
  const [successMessage, setSuccessMessage] = useState('');  // Success message state

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorState('');
    setSuccessMessage('');  // Clear any previous success messages

    const token = localStorage.getItem('token');  // Get token from localStorage
    if (!token) {
      setErrorState('No token found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: channelName,
          description,
          category,
          isPrivate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannelName('');
        setDescription('');
        setCategory('team');
        setIsPrivate(false);

        // Set success message
        setSuccessMessage('Workroom successfully created!');

        await fetchChannels();  // Re-fetch the channels list
      } else {
        const errorData = await response.json();
        setErrorState(errorData.error);
      }
    } catch (err) {
      setErrorState('Failed to create channel');
    } finally {
      setIsLoading(false);  // Set loading state to false
    }
  };

  return (
    <div className="my-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Create a Workroom</h3>
      <form onSubmit={handleCreateChannel} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">
            Workroom Name
          </label>
          <input
            type="text"
            id="channelName"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            required
            placeholder="Enter channel name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description of the workroom"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="team">Team Workspace</option>
            <option value="project">Project Workspace</option>
            <option value="community">Community Workspace</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="isPrivate" className="block text-sm font-medium text-gray-700">
            Privacy
          </label>
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Private (Invitation only)</span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Workroom'}
        </button>
      </form>

      {/* Display error message if it exists */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Display success message if it exists */}
      {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
    </div>
  );
};

export default CreateChannel;
