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
  console.log("Device connected:", socket.id);

  socket.on("device:join", (device) => {
    const existing = devices.find((d) => d.id === socket.id);

    if (!existing) {
      devices.push({
        id: socket.id,
        name: device.name,
        type: device.type,
        online: true,
      });
    }

    io.emit("devices:update", devices);
  });

  socket.on("disconnect", () => {
    devices = devices.filter((d) => d.id !== socket.id);

    io.emit("devices:update", devices);

    console.log("Device disconnected:", socket.id);
  });
});

app.get("/", (_, res) => {
  res.send("DropBeam Server Running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});