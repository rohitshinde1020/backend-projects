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
const server = http.createServer(app);

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHelper.setIO(io);
io.use(socketAuth);

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

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
