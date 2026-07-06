

const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');


// Middleware to protect routes by verifying JWT tokens
// This middleware checks for a token in the request headers, verifies it, and attaches the user information to the request object if valid.
const protectroute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = protectroute;