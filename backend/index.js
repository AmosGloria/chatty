// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./connectDatabase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple route to test
app.get('/', (req, res) => {
  res.send('Chatty Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
