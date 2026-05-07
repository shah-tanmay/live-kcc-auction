// server.js

// ─── DNS override — must be first ─────────────────────────────────────────────
// ISPs in India often block DNS SRV record lookups, which mongodb+srv:// requires.
// Forcing Google's public DNS (8.8.8.8) resolves this before Next.js or Mongoose
// make any network calls.
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");
// ──────────────────────────────────────────────────────────────────────────────

import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res); // let Next.js handle everything else
  });

  // attach socket.io to that HTTP server
  const io = new IOServer(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  // store globally so your API routes can import it
  global.__io = io;

  io.on("connection", (socket) => {
    console.log("➕ new socket:", socket.id);

    socket.on("joinAuction", (playerId) => {
      socket.join(`auction:${playerId}`);
    });

    socket.on("disconnect", () => {
      console.log("– client disconnected");
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
