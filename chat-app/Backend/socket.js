let io = null;
const usersocketMap = {};

// This module provides helper functions to manage the Socket.IO instance and track user socket connections.
function setIO(serverIO) {
  io = serverIO;
}

// This function returns the current Socket.IO instance, allowing other parts of the application to access it for emitting events to connected clients.
function getIO() {
  return io;
}

module.exports = { setIO, getIO, usersocketMap };
