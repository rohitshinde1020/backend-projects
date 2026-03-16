const User = require("../models/usermodel");
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt =require("bcryptjs");
const Chat = require("../models/chat");

const registeruser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(201).json({ success: false, message: "All fields are required" });
    }

    try {
        const isuser = await User.findOne({ email: email });
        if (isuser) {
            return res.status(201).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashpassword,
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        })


        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfull",
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering user", error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(201).json({ success: false, message: "All fields are required" });
    }

    try {
        const foundUser = await User.findOne({ email: email });
        if (!foundUser) {
            return res.status(201).json({ success: false, message: "Invalid credentials" });
        }

        const ispasswordcorrect = await bcrypt.compare(password, foundUser.password);
        if (!ispasswordcorrect) {
            return res.status(201).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: foundUser._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        })

        res.status(201).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error logging in", error: error.message });

    }
}

const getuserdata = (req, res) => {
    try{
        const user = req.user;
        return res.json({ success: true, message: "User data fetched successfully", user });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });    
    }
}


//api to get get published images
// Chat Collection
//       ↓
// Unwind messages array
//       ↓
// Filter published images
//       ↓
// Select image URL + username
//       ↓
// Reverse order
//       ↓
// Send response to client
const getpublished = async (req, res) => {
    try {
        const pushlishedContent = await Chat.aggregate([
            { $unwind: "$messages" },
            { 
                $match: { 
                    "messages.ispublished": true, 
                    "messages.isImage": true 
                } 
            },
            { 
                $project: { 
                    _id: 0, 
                    imageurl: "$messages.content",
                    userName: "$userName",
                } 
            }
        ]);
        res.status(200).json({ success: true, message: "Published content fetched successfully", images:pushlishedContent.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching published content", error: error.message });
    }
}

module.exports = { registeruser, login, getuserdata, getpublished }