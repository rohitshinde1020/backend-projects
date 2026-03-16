require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectdb = require('./config/DB.js');
const router = require('./routers/mainrouter.js');
const chatrouter = require('./routers/chatroutes.js');
const messagerouter = require('./routers/messagerouter.js');
const creditrouter = require('./routers/creditsroutes.js');
const port=process.env.PORT || 3000;

const app=express();

connectdb();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send('server is live')
})

app.use('/api/user',router);
app.use('/api/chat',chatrouter);
app.use('/api/message',messagerouter);
app.use('/api/credits',creditrouter );

module.exports=app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})

