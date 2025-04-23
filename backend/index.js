const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./passportConfig');

const authRoutes = require('./routes/authRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reactionRoutes = require('./routes/reactionRoutes'); //

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());

// Create HTTP server and attach Socket.IO
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

//  Inject `io` into every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reactions', reactionRoutes); //  Reaction routes

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Chaty backend!" });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`User joined channel: ${channelId}`);
  });

  socket.on('sendMessage', ({ channelId, message }) => {
    console.log(`Message to channel ${channelId}:`, message);
    io.to(channelId).emit('receiveMessage', message);
  });

  socket.on('typing', ({ channelId, username }) => {
    socket.to(channelId).emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
