// backend/index.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./passportConfig'); // Google OAuth setup
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const channelRoutes = require('./routes/channelRoutes'); //Import Channel routes
const messageRoutes = require('./routes/messageRoutes');  // Import message routes



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions

// Use routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/channels', channelRoutes); //channel routes
app.use('/api/messages', messageRoutes);  // Mount message routes at /api/messages


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
