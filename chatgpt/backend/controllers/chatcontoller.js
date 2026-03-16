const Chat = require('../models/chat.js');

const createchat = async (req, res) => {
    
    try {
        const userId = req.user._id;
        const newChat = await Chat.create({
            userId,
            messages: [],
            name:'new chat',
            userName:req.user.name
        });
        
        res.status(201).json({ success: true, message: "Chat created successfully", chat: newChat });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing message", error: error.message });
    }
}

const getallchats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
        
        res.status(200).json({ success: true, chats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching chats", error: error.message });
    }
}

const deletechat = async (req, res) => {
    try {
        const userId = req.user._id;
        const {chatId} = req.body;

        const deletedChat = await Chat.findOneAndDelete({ _id: chatId, userId });

        if (!deletedChat) {
            return res.status(404).json({ success: false, message: "Chat not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting chat", error: error.message });
    }
}

module.exports = { createchat, getallchats, deletechat };