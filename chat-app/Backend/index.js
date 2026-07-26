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

// what is trust proxy in express?In Express, the `trust proxy` setting is used to determine how the application should handle the `X-Forwarded-*` headers that are set by proxies (like load balancers or reverse proxies) in front of your application.
// what is the purpose of setting trust proxy to 1? Setting `trust proxy` to `1` tells Express that there is one 
// proxy in front of the application. This means that Express will trust the first `X-Forwarded-*` header it receives, 
// which is important for correctly identifying the client's IP address and protocol (HTTP or HTTPS) when your app is behind a proxy.

// what is proxy in express? In Express, a proxy refers to an intermediary server that sits between the client and the application server.
// Proxies can be used for various purposes, such as load balancing, caching, or security. When an application is behind a proxy, 
// the original client request may be modified or augmented with additional headers (like `X-Forwarded-For` for the client's IP address). 
// The `trust proxy` setting in Express allows the application to correctly interpret these headers and obtain accurate information about the client's request.
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

// 
const PORT = process.env.PORT || 5000;

// Create HTTP server and integrate with Socket.IO 
// where is socket.io server created? The Socket.IO server is created in the line `const io = new Server(server, { ... })`, where `server` is the HTTP server created using `http.createServer(app)`. This allows Socket.IO to listen for WebSocket connections on the same server that serves the Express application.
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

// Initialize Socket.IO server with CORS settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


socketHelper.setIO(io);
io.use(socketAuth);
//    QUESTION ->   i want complete flow of socket.io connection and disconnection with userId and socket.id mapping. Can you explain it? Sure! Here's a complete flow of how the Socket.IO connection and disconnection works with userId and socket.id mapping in your code:
// 1. **Socket.IO Server Initialization**: The Socket.IO server is initialized with the HTTP server and CORS settings. This allows clients to connect to the server using WebSockets.
// 2. **Connection Event**: When a client connects to the Socket.IO server, the `connection` event is triggered. The server receives a `socket` object representing the connected client.
// 3. **User Identification**: The `socketAuth` middleware is used to authenticate the user and attach the `userId` to the `socket` object. This allows the server to identify which user is connected.
// 4. **Mapping userId to socket.id**: Inside the `connection` event handler, the server checks if the `userId` exists. If it does, it maps the `userId` to the `socket.id` in the `socketHelper.usersocketMap`. This mapping allows the server to keep track of which socket belongs to which user.
// 5. **Broadcasting Online Users**: After mapping, the server emits an event called `onlineUsers`, sending a list of currently connected userIds (keys of `usersocketMap`) to all connected clients. This allows clients to know who is online.
// 6. **Disconnection Event**: When a client disconnects, the `disconnect` event is triggered. The server logs that a user has disconnected and
//   checks if the `userId` exists. If it does, it removes the mapping of that `userId` from the `usersocketMap`.
// 7. **Broadcasting Updated Online Users**: After removing the mapping, the server emits the `onlineUsers` event again, sending the updated list of currently connected userIds to all connected clients. This allows clients to know who is still online after a user disconnects.


io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log('A user connected:', userId);

  if (userId) {
    socketHelper.usersocketMap[userId] = socket.id;
  }

  // what io.emit does in socket.io? In Socket.IO, `io.emit` is used to send a message to all connected clients. It broadcasts the specified event and data to every client that is currently connected to the Socket.IO server. 
  // This is useful for scenarios where you want to notify all users about a particular event, such as updating the list of online users or broadcasting a chat message.
  io.emit('onlineUsers', Object.keys(socketHelper.usersocketMap));

  socket.on('disconnect', () => {
    console.log('A user disconnected:', userId);

    if (userId) {
      delete socketHelper.usersocketMap[userId];
    }

    // what io.emit does in socket.io? In Socket.IO, `io.emit` is used to send a message to all connected clients. It broadcasts the specified event and data to every client that is currently connected to the Socket.IO server. This is useful for scenarios where you want to notify all users about a particular event, such as updating the list of online users or broadcasting a chat message.
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
