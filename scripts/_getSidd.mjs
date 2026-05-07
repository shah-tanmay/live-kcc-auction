import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('players_2026');

const s = await col.find({ name: { $regex: /sidd/i } }).toArray();
console.log(s.map(p => p.name));

await mongoose.disconnect();
process.exit(0);
