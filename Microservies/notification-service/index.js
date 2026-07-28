const amqp = require("amqplib");

let connection;
let channel;

async function start() {

    while (true) {
        try {
            console.log("Connecting to RabbitMQ...");

            connection = await amqp.connect(
                "amqp://rabbitmq:5672"
            );

            channel = await connection.createChannel();

            await channel.assertQueue(
                "task_queue",
                { durable: true }
            );

            console.log(
                "Notification service connected to RabbitMQ"
            );

            channel.consume("task_queue", (msg) => {
                if (msg !== null) {

                    const taskData = JSON.parse(
                        msg.content.toString()
                    );

                    console.log(
                        "Received task:",
                        taskData
                    );

                    // Send notification

                    channel.ack(msg);
                }
            });

            return;

        } catch (err) {

            console.error(
                "RabbitMQ connection failed:",
                err.message
            );

            console.log("Retrying in 3 seconds...");

            await new Promise(resolve =>
                setTimeout(resolve, 3000)
            );
        }
    }
}

start();