const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Middleware to authenticate socket connections using JWT
// This middleware checks for a token in the socket handshake, verifies it, and attaches the user ID to the socket object if valid.
const socketAuth = async (socket, next) => {
  try {
    // Extract the token from the socket handshake authentication data sent by the client during the connection attempt.
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }
    // Attach the user ID to the socket object for later use in event handlers.
    // This allows us to identify the user associated with each socket connection and manage their interactions accordingly.
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

module.exports = socketAuth;
