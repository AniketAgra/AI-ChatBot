require('dotenv').config();
const app = require('./src/app');
const {createServer} = require('http');
const {Server} = require('socket.io');
const generateResponse = require('./src/services/ai.service');
const { json } = require('stream/consumers');


const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors:{
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
 });

//implementing short-term memory

const chatHistory = [
    {
        role: "user",
        parts: [{ text: 'who are you?' }],
    },
    {
        role: "model",
        parts: [
            {
                text: 'I am a large language model, trained by Google.',
            }
        ]
    }
];

//whenever a user connects, this will be called
io.on("connection", (socket) => {
  console.log("A user connected");

  // Build-in event listeners for the socket
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

    socket.on("ai-message", async(data) => {

        chatHistory.push(
            {
                role: "user",
                parts: [{ text: data }],
            }
        );

        const response = await generateResponse(chatHistory);
        console.log("AI Response:", response);
        socket.emit("ai-response-message", { response });
    });
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
})