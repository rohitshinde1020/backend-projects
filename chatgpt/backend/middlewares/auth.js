const User = require('../models/usermodel.js');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token = req.cookies.token;

    // Support both cookie auth and Authorization header auth.
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;
    }

    if(!token){
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId=decoded.id;

        const user=await User.findById(userId);

        if(!user){
            return res.status(404).json({ success: false, message: "Not authorized , User not found" });
        }
        req.user=user;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
};

module.exports = { protect };

