import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('players_2026');
const mayur = await col.findOne({ name: { $regex: /mayur/i } });
console.log('Mayur 2026:', JSON.stringify(mayur, null, 2));
await mongoose.disconnect();
process.exit(0);
