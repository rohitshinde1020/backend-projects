const express = require('express');
const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../config/nodemailer');
const { getRedis } = require('../config/redis');
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const crypto = require('crypto');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
    const { name, password } = req.body;
    const email = req.body.email?.trim()?.toLowerCase();

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SENDER) {
        return res.status(500).json({ success: false, message: "Email service is not configured" });
    }
    try {
        const existinguser = await User.findOne({ email: email });
        if (existinguser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const gensalt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, gensalt)
        const newuser = await User.create({
            name: name,
            email: email,
            password: hashpassword

        })

        const redis = getRedis();
        const sid = crypto.randomUUID();
        const token = jwt.sign(
            { id: newuser._id, sid },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        await redis.set('sess:' + sid, String(newuser._id), { EX: SESSION_TTL_SECONDS });

        res.cookie('token', token, cookieOptions)

        const option = {
            from: process.env.SENDER,
            to: newuser.email,
            subject: "Welcome to AuthMern platform",
            text: `Hello ${newuser.name},\n\nWelcome to AuthMern! We're excited to have you on board.\n\nBest regards,\nThe AuthMern Team`
        };

        try {
            await transporter.sendMail(option);
        } catch (mailErr) {
            console.error("register mail error:", mailErr.message);
        }

        res.status(201).json({ success: true, message: "User registered successfully" });



    }
    catch (error) {

        res.status(500).json({ success: false, message: "Registeration failed" })
    }

}

const login = async (req, res) => {
    const { password } = req.body;
    const email = req.body.email?.trim()?.toLowerCase();
    const redis = getRedis();

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const rlKey = 'rl:login:' + ip + ':' + email;
    const attempts = Number(await redis.get(rlKey) || 0);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const ttl = await redis.ttl(rlKey);
        return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Try again later.',
            retryAfterSeconds: ttl > 0 ? ttl : LOGIN_BLOCK_SECONDS
        });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const count = await redis.incr(rlKey);
            if (count === 1) await redis.expire(rlKey, LOGIN_BLOCK_SECONDS);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            const count = await redis.incr(rlKey);
            if (count === 1) await redis.expire(rlKey, LOGIN_BLOCK_SECONDS);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        await redis.del(rlKey);

        const sid = crypto.randomUUID();
        const token = jwt.sign(
            { id: user._id, sid },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        await redis.set('sess:' + sid, String(user._id), { EX: SESSION_TTL_SECONDS });

        res.cookie('token', token, cookieOptions);
        return res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
};


/* const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        res.status(200).json({ success: true, message: "logout successfull" })
    }
    catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
} */

const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const redis = getRedis();
                if (decoded.sid) {
                    await redis.del('sess:' + decoded.sid);
                }
            } catch (_) { }
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        return res.status(200).json({ success: true, message: 'logout successfull' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const verify_otp_sent = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SENDER) {
            return res.status(500).json({ success: false, message: "Email service is not configured" });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(201).json({ success: false, message: "User not found" });
        }

        if (user.isverify) {
            return res.status(201).json({ success: false, message: "User already verified" });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000))

        user.verifyotp = otp;
        user.verifyotpexpiry = Date.now() + 60 * 60 * 1000;
        await user.save();

        const option = {
            from: process.env.SENDER,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}. Your account can be verified using this OTP.`
        };

        try {
            await transporter.sendMail(option);
        } catch (mailErr) {
            user.verifyotp = "";
            user.verifyotpexpiry = 0;
            await user.save();
            console.error("verify_otp_sent mail error:", mailErr.message);
            return res.status(502).json({ success: false, message: "Failed to send verification OTP email" });
        }

        res.json({ success: true, message: "verification OTP sent on receiver email address" })

    }
    catch (error) {
        console.error("verify_otp_sent error:", error.message);
        res.status(500).json({ success: false, message: "Operation failed" })
    }
}

const verifyemail = async (req, res) => {

    const { otp } = req.body;
    const userId = req.userId || req.body.userId;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user || user === null) {
            return res.status(400).json({ success: false, message: "User not found " });
        }

        if (user.isverify) {
            return res.status(400).json({ success: false, message: "User already verified" });
        }

        if (String(user.verifyotp) !== String(otp) || Date.now() > user.verifyotpexpiry) {
            return res.status(400).json({ success: false, message: "Either OTP is wrong or has expired" });
        }

        user.isverify = true;
        user.verifyotp = "";
        user.verifyotpexpiry = 0;

        await user.save();
        res.status(200).json({ success: true, message: "User verified successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Email verification failed" });
    }


}

const resetpassword = async (req, res) => {
    const email = req.body.email?.trim()?.toLowerCase();
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SENDER) {
        return res.status(500).json({ success: false, message: "Email service is not configured" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || user === null) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));

        user.resetOTP = otp;
        user.resetotpexpiry = Date.now() + 60 * 60 * 1000;
        await user.save();

        const options = {
            from: process.env.SENDER,
            to: user.email,
            subject: "Password Reset OTP ",
            text: `Your OTP for password reset is ${otp}. Use this OTP to reset your password.`
        };

        try {
            await transporter.sendMail(options);
        } catch (mailErr) {
            user.resetOTP = "";
            user.resetotpexpiry = 0;
            await user.save();
            console.error("resetpassword mail error:", mailErr.message);
            return res.status(502).json({ success: false, message: "Failed to send reset OTP email" });
        }

        res.status(200).json({ success: true, message: "Password reset OTP sent to your email", userId: user._id });
    }
    catch (err) {
        console.error("resetpassword error:", err.message);
        res.status(500).json({ success: false, message: "Operation failed" });
    }
}

const verifyresetotp = async (req, res) => {
    const { userId, otp, newpassword } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "User and OTP are required" });
    }
    try {
        const user = await User.findById(userId);

        if (!user || user === null) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({ success: false, message: "Invalid OTP format" });
        }
        if (String(user.resetOTP) !== String(otp) || Date.now() > user.resetotpexpiry) {
            return res.status(400).json({ success: false, message: "Either OTP is wrong or has expired" });
        }

        if (!newpassword) {
            return res.status(200).json({ success: true, message: "OTP verified successfully" });
        }
        if (String(newpassword).length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const gensalt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(newpassword, gensalt);
        user.password = hashpassword;
        user.resetOTP = "";
        user.resetotpexpiry = 0;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successful" });
    }
    catch (err) {
        console.error("verifyresetotp error:", err.message);
        res.status(500).json({ success: false, message: "Password reset failed" });
    }
}

/* const authmiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();

    }
    catch (err) {
        res.status(401).json({ success: false, message: "Unauthorized access" });
    }

} */

const authmiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const redis = getRedis();
        const storedUserId = await redis.get('sess:' + decoded.sid);

        if (!storedUserId || storedUserId !== String(decoded.id)) {
            return res.status(401).json({ success: false, message: 'Session expired or revoked' });
        }

        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
};

const isauthenticated = (req, res) => {
    try {
        res.json({ success: true, message: "User is authenticated" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Operation failed" });
    }
}

module.exports = { register, login, logout, verify_otp_sent, verifyemail, resetpassword, verifyresetotp, authmiddleware, isauthenticated };