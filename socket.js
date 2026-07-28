const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: {
        origin: "*"
    }
});

// what is io.on ? 
// io.on is a method provided by Socket.IO to listen for events 
// which events ? 
// "connection" event is triggered when a client connects to the server

// what is connection event ?
// The "connection" event is triggered when a client establishes a connection with the server. 
// It provides a socket object that represents the connection between the client and the server. 
// This socket object can be used to communicate with the connected client, send messages, and listen for events from that client.

// so connection event is already defined in socket.io library and we are just listening to it using io.on method
// what are the other events we are listening to ?
// The other events we are listening to are "joinRoom", "sendMessage", "typing", and "disconnect". 
// These events are custom events that we define to handle specific actions in our application, such as joining a room, sending a message, indicating typing status, and handling disconnections.
// so they r jjust a name we give to the event and we can name it anything we want but we have to use the same name on the client side to listen to the event
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // what is joinRoom ?
    // The "joinRoom" event is triggered when a client wants to join a specific room.1
    socket.on("joinRoom", (roomId) => {

        socket.join(roomId);

        socket.to(roomId).emit(
            "userJoined",
            socket.id
        );

    });

    // what is sendMessage ?
    // The "sendMessage" event is triggered when a client wants to send a message to a specific room. 
    // It takes an object containing the roomId and the message as parameters. 
    // The server then emits the "receiveMessage" event to all clients in that room, including the sender, with the sender's socket ID and the message.
    socket.on("sendMessage", ({ roomId, message }) => {

        io.to(roomId).emit(
            "receiveMessage",
            {
                sender: socket.id,
                message
            }
        );

    });

    // what is typing ?
    // The "typing" event is triggered when a client starts or stops typing a message in a specific room. 
    // It takes the roomId as a parameter. 
    // The server then emits the "userTyping" event to all clients in that room, indicating which client is typing.
    socket.on("typing", (roomId) => {

        socket.to(roomId).emit(
            "userTyping",
            socket.id
        );

    });

    // Disconnect
    socket.on("disconnect", () => {

        console.log(
            "Disconnected:",
            socket.id
        );

    });

});

// | Method                    | Meaning                 |
// | ------------------------- | ----------------------- |
// | `socket.on()`             | Listen for event        |
// | `socket.emit()`           | Send to current socket  |
// | `io.emit()`               | Send to everyone        |
// | `socket.broadcast.emit()` | Everyone except sender  |
// | `socket.join()`           | Join room               |
// | `socket.leave()`          | Leave room              |
// | `io.to(room).emit()`      | Everyone in room        |
// | `socket.to(room).emit()`  | Room except sender      |
// | `socket.id`               | Connection ID           |
// | `socket.handshake`        | Initial connection info |
// | `socket.disconnect()`     | Disconnect socket       |
// | `socket.on("disconnect")` | Detect disconnection    |
// | `io.use()`                | Connection middleware   |
