const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let devices = [];

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("device:join", (device) => {
    const existing = devices.find(
      (d) => d.id === socket.id
    );

    if (!existing) {
      devices.push({
        id: socket.id,
        name: device.name,
        type: device.type || "Android",
        online: true,
      });
    }

    io.emit("devices:update", devices);
  });

  socket.on("webrtc:offer", (data) => {
    io.to(data.target).emit(
      "webrtc:offer",
      {
        offer: data.offer,
        sender: socket.id,
      }
    );
  });

  socket.on("webrtc:answer", (data) => {
    io.to(data.target).emit(
      "webrtc:answer",
      {
        answer: data.answer,
        sender: socket.id,
      }
    );
  });

  socket.on(
    "webrtc:ice-candidate",
    (data) => {
      io.to(data.target).emit(
        "webrtc:ice-candidate",
        {
          candidate: data.candidate,
          sender: socket.id,
        }
      );
    }
  );

  socket.on("disconnect", () => {
    devices = devices.filter(
      (d) => d.id !== socket.id
    );

    io.emit("devices:update", devices);

    console.log(
      "Disconnected:",
      socket.id
    );
  });
});

app.get("/", (_, res) => {
  res.send(
    "DropBeam Signaling Server Running"
  );
});

server.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});