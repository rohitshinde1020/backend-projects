
const User = require('../models/UserModel');
const Message = require('../models/MessageModel');
const cloudinary = require('../DB/Cloudinary');
const socketHelper = require('../socket');
//get all users except logged in user

const getAllUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        // Fetch all users from the database except the logged-in user and exclude the password field from the results for security reasons
        // The $ne operator is used to filter out the logged-in user based on their _id, ensuring that only other users are returned in the response
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select('-password');

        const unseenmsg = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false });
            if (messages.length > 0) {
                unseenmsg[user._id] = messages.length;
            }
        });

        await Promise.all(promises);
        res.status(200).json({ success: true, users: filteredUsers, unseenmsg });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const msgofselecteduser = async (req, res) => {
    try {
        const userId = req.user._id;
        const selectedUserId = req.params.id;
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: userId }
            ]
        })

        await Message.updateMany({ senderId: selectedUserId, receiverId: userId, seen: false }, { $set: { seen: true } });

        res.status(200).json({ success: true, messages });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Controller to mark messages as seen
const markMessagesAsSeen = async (req, res) => {
    try {
        const {id} = req.params;

        await Message.findByIdAndUpdate(id,{seen:true  });
        res.status(200).json({ success: true, message: 'Messages marked as seen' });
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//send message to selected user
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { text = '', image } = req.body;
        const receiverId = req.params.id;

        if (!text.trim() && !image) {
            return res.status(400).json({ success: false, message: 'Message text or image is required' });
        }

        let imageUrl = '';
        if(image){
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url;
        }
        const newMessage = new Message({
            text: text.trim(),
            senderId,
            receiverId,
            image: imageUrl
        });

        await newMessage.save();

        const io = socketHelper.getIO();
        const receiverSocketId = socketHelper.usersocketMap[receiverId];
        if (io && receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', { message: newMessage });
        }

        res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
}



module.exports = { getAllUsers, msgofselecteduser, markMessagesAsSeen, sendMessage };