const db = require('../connectDatabase');  // Using mysql2 connection

// Create a new channel
const createChannel = async (name, createdBy) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO channels (name, created_by) VALUES (?, ?)';
    db.query(query, [name, createdBy], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Get all channels
const getChannels = async () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM channels';
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createChannel,
  getChannels,
};
