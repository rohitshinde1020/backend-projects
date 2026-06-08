const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const cloudinary = require('../DB/Cloudinary');


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const safeUser = await User.findById(user._id).select('-password');

        res.status(200).json({ token, success: true, message: 'Login successful', user: safeUser });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });

    }
}

const register = async ( req, res) => {
    const { username, email, password ,bio } = req.body;

    try {
        if (!username || !email || !password || !bio ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, bio });
        await newUser.save();

        const token = jsonwebtoken.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const safeUser = await User.findById(newUser._id).select('-password');

        res.status(201).json({ token, success: true, message: 'User registered successfully', user: safeUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Controller to check if user is authenticated
const checkAuth = async (req, res) => {
    res.json({ success: true, message: 'User is authenticated', user: req.user });
}

const updateProfile = async (req, res) => {
    const { username, bio , profilePic } = req.body;
    const userId = req.user._id;
    let updatedUser;
    try {
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, { username, bio }, { new: true }).select('-password');
        }
        else {
            const uplaod = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { username, bio, profilePicture: uplaod.secure_url }, { new: true }).select('-password');
        }
        res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { login, register ,checkAuth, updateProfile};