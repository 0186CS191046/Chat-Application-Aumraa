import express from "express";
import config from "./src/config/index.js";
import http from "http";
import { Server } from "socket.io";
import { connectToDB } from "./src/config/db.js";
import routes from "./src/route/index.js";
import morgan from "morgan";
import cors from "cors";

connectToDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors("*"));

app.use(routes);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const onlineUsers = new Map();
const users = {};
// One-to-one user communication

io.on("connection", (socket) => {
  socket.on("register", (userEmail) => {
    onlineUsers.set(userEmail, socket.id);
    socket.emit("online-users", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("user-joined", userEmail);
  });

  socket.on("send-message", ({ senderEmail, receiverEmail, message }) => {
    const payload = {
      senderEmail,
      receiverEmail,
      message,
      createdAt: new Date().toISOString(),
    };

    const receiverSocketId = onlineUsers.get(receiverEmail);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", payload);
    }

    const senderSocketId = onlineUsers.get(senderEmail);
    if (senderSocketId) {
      io.to(senderSocketId).emit("receive-message", payload);
    }
  });
socket.on("join-group", ({ groupId }) => {
  const room = `group-${groupId}`;
  socket.join(room);
  console.log(`Socket ${socket.id} joined ${room}`);
});

socket.on("send-group-message", ({ senderEmail, groupId, message }) => {
  const room = `group-${groupId}`;
  console.log("Group message to:", room);

  io.to(room).emit("receive-group-message", {
     groupId,
    senderEmail,
    message,
    createdAt: new Date().toISOString(),
  });
});



socket.on("join-room", ({ userId, roomId }) => {
    users[userId] = socket.id;
    socket.join(roomId);
  });


  socket.on("offer", ({ to, from, offer }) => {
    // find socketId of the target user
    console.log("Offreing..........",to,from);
    const targetSocketId = users[to]; // your mapping of userId/email → socketId
    if (targetSocketId) {
      socket.to(targetSocketId).emit("offer", { from, offer });
    }
  });


  socket.on("answer", ({ to, from, answer }) => {
    console.log("Ansering..........",to,from);
    const targetSocketId = users[to];
    if (targetSocketId) {
      socket.to(targetSocketId).emit("answer", { from, answer });
    }
  });

   socket.on("ice-candidate", ({ to, from, candidate }) => {
    console.log("ice-candidate",to,from);
    
    const targetSocketId = users[to];
    if (targetSocketId) {
      socket.to(targetSocketId).emit("ice-candidate", { from, candidate });
    }
  });

  socket.on("disconnect", () => {
    let disconnectedEmail = null;

    for (let [email, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        disconnectedEmail = email;
        onlineUsers.delete(email);
        break;
      }
    }

    if (disconnectedEmail) {
      console.log(`${disconnectedEmail} went offline`);
      io.emit("user-left", disconnectedEmail);
    }
    if (socket.userId) {
      delete users[socket.userId];
    }

    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-disconnect", socket.userId);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Everything is OK!")
});

server.listen(config.port, () => {
  console.log("Server is listening on port :", config.port);
});
