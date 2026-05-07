import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('players_2026');

const jee = await col.findOne({ name: { $regex: /jee/i } });
console.log('JEE oswal:', JSON.stringify(jee, null, 2));

const sidd = await col.findOne({ name: { $regex: /sidd/i } });
console.log('sidd:', JSON.stringify(sidd, null, 2));

await mongoose.disconnect();
process.exit(0);
