// test-bid.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socket",
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to socket with ID:", socket.id);

  // Emit a bid
  socket.emit("newBid", {
    playerId: "PLAYER123",
    amount: 1200000,
    teamName: "Admin CLI",
    teamId: "admin-team",
  });

  // Optionally emit a sale
  // socket.emit("playerSold", {
  //   playerId: "PLAYER123",
  //   amount: 1200000,
  //   teamName: "Admin CLI"
  // });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket.");
});
