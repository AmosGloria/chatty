const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./passportConfig');

const authRoutes = require('./routes/authRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const channelMemberRoutes = require('./routes/channelMemberRoutes');
const roleRoutes = require('./routes/roleRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/channel-members', channelMemberRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Chaty backend!" });
});

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Make io available to request handlers if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinChannel', (channelId) => {
    const room = channelId.toString();
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


// Export io and server so controller can use io instance
module.exports = { io, server };
