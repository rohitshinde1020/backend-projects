const express = require('express')
const app=express()
const mongoose=require('mongoose')

const port=3000;
app.use(express.json())
mongoose.connect('mongodb://mongo:27017/users').then(
    ()=>console.log("mongodb connectedd successfully")
).catch(err=>console.error('mongodb connection error :',err))

const UserSchema = new mongoose.Schema({
    name:String,
    email:String
});

const User = mongoose.model('User',UserSchema);

app.post('/users',async (req,res)=>{
    const {name,email } = req.body;
    
    try{
        const user = new User({name,email})
        await user.save();
        res.status(201).json(user)
    }
    catch(err){
        console.error("the error occured :",err)
        res.status(500).json({error:"internal server error"})
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

app.get('/',(req,res)=>{
    res.send('hello world');
})


app.listen(port,()=>{
    console.log(`app is listening at ${port}`)
})
