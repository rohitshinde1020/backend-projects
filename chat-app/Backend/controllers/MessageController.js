
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
        // For each of the filtered users, we check for any unseen messages sent by that user to the logged-in user. 
        // We use Promise.all to handle multiple asynchronous operations concurrently, allowing us to efficiently gather the count of unseen messages for each user and store it in the unseenmsg object.
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

        // Mark the message with the specified ID as seen by updating its 'seen' field to true in the database.
        // This allows us to track which messages have been viewed by the recipient and update the message status accordingly.
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
        // If an image is included in the request, we upload it to Cloudinary and retrieve the secure URL to store in the message document. This allows us to handle image attachments in messages and provide a way to access the uploaded images securely.
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

        // After saving the new message to the database, we emit a 'newMessage' event to the receiver's socket using Socket.IO. 
        // This allows us to notify the recipient in real-time about the new message they have received, enabling a seamless and interactive messaging experience.
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