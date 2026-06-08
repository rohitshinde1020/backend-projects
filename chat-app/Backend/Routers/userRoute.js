const express = require('express');
const userRouter = express.Router();
const { login, register, checkAuth, updateProfile } = require('../controllers/usercontroller');
const protectroute = require('../middleware/auth');

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/check-auth', protectroute, checkAuth);
userRouter.put('/update-profile', protectroute, updateProfile);

module.exports = userRouter;
