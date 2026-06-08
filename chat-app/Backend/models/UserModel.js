const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    username: {type:String, required:true,unique:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    profilePicture: {type:String, default:''},
    bio: {type:String, default:''},
},{timestamps:true});

const User = mongoose.model('User', userschema);

module.exports = User;