import express from "express";
import config from "./src/config";
import http from "http";
import { Server } from "socket.io";
import { connectToDB } from "./src/config/db";
import routes from "./src/route/index";
import morgan from "morgan";
import cors from "cors";

connectToDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"));
app.use(cors());

app.use(routes);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const users = {};


io.on("connection", (socket) => {
  socket.on("register", (userId) => {
  users[userId] = socket.id;
  console.log("User registered:", userId, "Socket:", socket.id);
});

socket.on("send-message", ({ senderId, receiverId, message }) => {
  console.log("send-message:", senderId, "→", receiverId, message);

  const payload = {
    senderId,
    receiverId,
    message,
    createdAt: new Date().toISOString(),
  };

  const receiverSocketId = users[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receive-message", payload);
  }

  const senderSocketId = users[senderId];
  if (senderSocketId) {
    io.to(senderSocketId).emit("receive-message", payload);
  }

});

socket.on("disconnect", () => {
  for (const userId in users) {
    if (users[userId] === socket.id) {
      delete users[userId];
      break;
    }
  }
  console.log("User disconnected:", socket.id);
});

})

app.get("/", (req, res) => {
    res.send("Everything is OK!")
});

server.listen(config.port, () => {
    console.log("Server is listening on port :", config.port);
});
