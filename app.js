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

const onlineUsers = new Map();


io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register", (userPhone) => {
    onlineUsers.set(userPhone, socket.id);
    console.log(`${userPhone} is now online`);

    socket.emit("online-users", Array.from(onlineUsers.keys()));

    socket.broadcast.emit("user-joined", userPhone);
  });

  socket.on("send-message", ({ senderPhone, receiverPhone, message }) => {
    const payload = {
      senderPhone,
      receiverPhone,
      message,
      createdAt: new Date().toISOString(),
    };

    const receiverSocketId = onlineUsers.get(receiverPhone);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", payload);
    }

    const senderSocketId = onlineUsers.get(senderPhone);
    if (senderSocketId) {
      io.to(senderSocketId).emit("receive-message", payload);
    }
  });

  socket.on("disconnect", () => {
    let disconnectedPhone = null;

    for (let [phone, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        disconnectedPhone = phone;
        onlineUsers.delete(phone);
        break;
      }
    }

    if (disconnectedPhone) {
      console.log(`${disconnectedPhone} went offline`);
      io.emit("user-left", disconnectedPhone);
    }
  });
});

app.get("/", (req, res) => {
    res.send("Everything is OK!")
});

server.listen(config.port, () => {
    console.log("Server is listening on port :", config.port);
});
