const express = require('express');
const { getAllUsers, msgofselecteduser, markMessagesAsSeen,sendMessage } = require('../controllers/MessageController');
const protectroute = require('../middleware/auth');
const messageRouter = express.Router();


messageRouter.get('/users',protectroute,getAllUsers);
messageRouter.get('/:id',protectroute,msgofselecteduser);
messageRouter.put('/mark-seen/:id',protectroute,markMessagesAsSeen);
messageRouter.post('/send/:id', protectroute, sendMessage);

module.exports = messageRouter;