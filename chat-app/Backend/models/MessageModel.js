const mongoose = require('mongoose');
const User = require('./UserModel');

const messageschema = new mongoose.Schema({
    text: {type:String, default:''},
    senderId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    receiverId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    image: {type:String},
    seen: {type:Boolean, default:false}

},{timestamps:true});

const Message = mongoose.model('Message', messageschema);

module.exports = Message;