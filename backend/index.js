const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
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

// Apply CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies or authorization headers
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session()); // needed for session-based auth

// Create HTTP server & Socket.IO server
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies and headers
  }
});

// Inject `io` into every Express request
app.use((req, res, next) => {
  req.io = io; // Making io available in all request handlers
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/channel-members', channelMemberRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Chaty backend!" });
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join the user to a specific channel
  socket.on('joinChannel', (channelId) => {
    socket.join(`channel-${channelId}`);
    console.log(`User joined channel: ${channelId}`);
  });

  // Receive message and emit to the channel
  socket.on('sendMessage', ({ channelId, message }) => {
    console.log(`Message to channel ${channelId}:`, message);
    io.to(`channel-${channelId}`).emit('receiveMessage', message); // Emit message to channel
  });

  // Handle typing event
  socket.on('typing', ({ channelId, username }) => {
    socket.to(`channel-${channelId}`).emit('typing', username); // Emit typing event to channel
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
