const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./DB/monodb');
const userRouter = require('./Routers/userRoute');
const messageRouter = require('./Routers/MessageRoute');
const { Server } = require('socket.io');
const socketHelper = require('./socket');
const socketAuth = require('./middleware/socketAuth');
const { getAllowedOrigins, validateEnv } = require('./config/env');

dotenv.config();
validateEnv();

const allowedOrigins = getAllowedOrigins();

app.set('trust proxy', 1);
app.use(express.json({ limit: '5mb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const PORT = process.env.PORT || 5000;
// Create an HTTP server using the Express app, which will be used to handle both HTTP requests and WebSocket connections through Socket.IO. 
// This allows us to serve our API endpoints while also enabling real-time communication with clients via WebSockets.
const server = http.createServer(app);

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler to catch CORS errors and other unhandled errors, 
// ensuring that we provide meaningful responses to the client and log any unexpected issues for debugging purposes.
app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Initialize Socket.IO server and set up authentication middleware for socket connections.
// This allows us to manage real-time communication with clients while ensuring that only authenticated users can establish socket connections and interact with the server.
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set the Socket.IO instance in the socketHelper module for later use in emitting events to connected clients.
// This allows us to access the Socket.IO instance from other parts of our application, such as controllers, to send real-time updates to clients based on certain actions or events.
socketHelper.setIO(io);
io.use(socketAuth);

// Handle Socket.IO connections and manage online user tracking. 
// When a client connects, we log the connection and store the user's socket ID in a mapping for later use in sending targeted messages. 
// We also emit an 'onlineUsers' event to all connected clients to keep them updated on the current online users. 
// When a client disconnects, we remove their socket ID from the mapping and emit the updated list of online users again.
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log('A user connected:', userId);

  if (userId) {
    socketHelper.usersocketMap[userId] = socket.id;
  }

  io.emit('onlineUsers', Object.keys(socketHelper.usersocketMap));

  socket.on('disconnect', () => {
    console.log('A user disconnected:', userId);

    if (userId) {
      delete socketHelper.usersocketMap[userId];
    }

    io.emit('onlineUsers', Object.keys(socketHelper.usersocketMap));
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown of the server on termination signals (e.g., SIGTERM, SIGINT) to ensure that we close the server properly and 
// allow any ongoing requests to complete before exiting the process. This helps prevent abrupt termination and potential data loss or corruption.
function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
}

// Listen for termination signals to trigger the shutdown process, allowing us to handle server shutdown gracefully when the application is stopped or restarted.
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
