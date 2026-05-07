import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('players_2026');
const kumar = await col.findOne({ name: { $regex: /waghresha/i } });
console.log('Kumar 2026 photoUrl:', kumar?.photoUrl || 'NONE');
await mongoose.disconnect();
process.exit(0);
