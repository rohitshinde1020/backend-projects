const expess = require('express');
const app = expess();
const mongoose = require('mongoose');
const amqp = require('amqplib');

const port = 3002;
app.use(expess.json());
mongoose.connect('mongodb://mongo:27017/tasks').then(
    () => console.log("mongodb connectedd successfully")
).catch(err => console.error('mongodb connection error :', err));
 
const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQ() {
    while (true) {
        try {
            connection = await amqp.connect("amqp://rabbitmq:5672");

            channel = await connection.createChannel();

            await channel.assertQueue("task_queue", {
                durable: true
            });

            console.log("Connected to RabbitMQ successfully");
            return;

        } catch (err) {
            console.error(
                "RabbitMQ connection failed:",
                err.message
            );

            await new Promise(resolve =>
                setTimeout(resolve, 3000)
            );
        }
    }
}

app.post('/tasks',async(req,res)=>{
    const {title,description,userId}=req.body;

    try{
        const task = new Task({title,description,userId})
        await task.save();
        const taskData = {
            id: task._id,
            title: task.title,
            description: task.description,
            userId: task.userId,
            createdAt: task.createdAt
        };
        if(!channel) {
            await connectRabbitMQ();
        }
        channel.sendToQueue('task_queue', Buffer.from(JSON.stringify(taskData)), { persistent: true });
        res.status(201).json(task);
    }
    catch(err){
        console.error("the error occured :",err)
        res.status(500).json({error:"internal server error"})
    }

})

app.get('/tasks', async (req, res) => {
    try {
        const task = await Task.find();

        res.status(200).json(task);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


app.listen(port, () => {
    console.log(`Task service listening at http://localhost:${port}`);
    connectRabbitMQ();
});