// pages/api/socketio.js

import { Server } from "socket.io";

export default function handler(req, res) {
  // We only want to initialize once
  if (!res.socket.server.io) {
    console.log("▶️  Setting up Socket.IO");

    // Attach to the raw HTTP server
    const io = new Server(res.socket.server, {
      path: "/api/socketio",
      cors: { origin: "*" },
    });

    // Store on the server so we can re-use later
    res.socket.server.io = io;

    // Optional: do your connection logic here
    io.on("connection", (socket) => {
      console.log("⚡️ New client connected:", socket.id);

      // e.g. you could have rooms per auction:
      socket.on("joinAuction", (playerId) => {
        socket.join(`auction:${playerId}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });
  }

  // Always send back something so Next doesn’t hang
  res.status(200).end();
}
