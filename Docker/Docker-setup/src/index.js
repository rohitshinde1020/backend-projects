const redis=require('ioredis');
const express=require('express');
const mongoose=require('mongoose');
const app=express();

const redis1=new redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get('/redis',async (req,res)=>{
    const reply=await redis1.ping();
    res.send({redis:reply});
})

app.get('/mongo',async (req,res)=>{
    if(mongoose.connection.readyState==0){
        await mongoose.connect("mongodb://localhost:27017/setup_database");

    }
    res.send({mongo:"connected",state:mongoose.connection.name});
})

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});