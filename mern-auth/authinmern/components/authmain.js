const express = require('express');
const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../config/nodemailer');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
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

        const token = jwt.sign(
            { id: newuser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        })

        const option = {
            from: process.env.SENDER,
            to: newuser.email,
            subject: "Welcome to AuthMern platform",
            text: `Hello ${newuser.name},\n\nWelcome to AuthMern! We're excited to have you on board.\n\nBest regards,\nThe AuthMern Team`
        };

        await transporter.sendMail(option);

        res.status(201).json({ success: true, message: "User registered successfully" });



    }
    catch (error) {

        res.status(500).json({ success: false, message: "Registeration failed" })
    }

}

const login = async (req, res) => {
    console.log("Login route hit");
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(201).json({ success: false, message: "Invalid email or password" });
        }

        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(201).json({ success: false, message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        })

        res.status(200).json({ success: true, message: "Login successful" });

    }
    catch (error) {

        res.status(500).json({ success: false, message: "Login failed" })
    }
}


const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        })
        res.status(200).json({ success: true, message: "logout successfull" })
    }
    catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

const verify_otp_sent = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
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

        await transporter.sendMail(option);

        res.json({ success: true, message: "verification OTP sent on receiver email address" })

    }
    catch (error) {
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
    const email = req.body.email;
    try {
        const user = await User.findOne({ email });
        if(!user || user === null){
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

        await transporter.sendMail(options);

        res.status(200).json({ success: true, message: "Password reset OTP sent to your email", userId: user._id });
    }
    catch (err) {
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
        if (String(user.resetOTP) !== String(otp) || Date.now() > user.resetotpexpiry) {
            return res.status(400).json({ success: false, message: "Either OTP is wrong or has expired" });
        }

        if (!newpassword) {
            return res.status(200).json({ success: true, message: "OTP verified successfully" });
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
        res.status(500).json({ success: false, message: "Password reset failed" });
    }
}

const authmiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).json({ success: false, message: "Unauthorized access" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();

    }
    catch (err) {
        res.status(400).json({ success: false, message: "Unauthorized access" });
    }

}

const isauthenticated = (req, res) => {
    try{
         res.json({ success: true, message: "User is authenticated" });
    }
   catch(err){  
        res.status(500).json({ success: false, message: "Operation failed" });
   }    
}

module.exports = { register, login, logout, verify_otp_sent, verifyemail, resetpassword, verifyresetotp, authmiddleware, isauthenticated };