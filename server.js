require('dotenv').config();
const app = require('./src/app');
const {createServer} = require('http');
const {Server} = require('socket.io');
const generateResponse = require('./src/services/ai.service');

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

//whenever a user connects, this will be called
io.on("connection", (socket) => {
  console.log("A user connected");

  // Build-in event listeners for the socket
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

    socket.on("ai-message", async(data) => {
        const response = await generateResponse(data.prompt);
        console.log("AI Response:", response);
        socket.emit("ai-response-message", { response });
    });
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
})