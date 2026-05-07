// lib/db.js
import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use Google's public DNS (8.8.8.8 / 8.8.4.4) for SRV lookups.
// This fixes "querySrv ECONNREFUSED" errors caused by ISPs that block SRV DNS records,
// which are required by the mongodb+srv:// connection string format.
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDB;
