import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('teams_2026');

const teams = await col.find({}).toArray();
console.log(teams.map(t => ({ team: t.name, owner: t.owner, ownerValuation: t.ownerValuation })));

await mongoose.disconnect();
process.exit(0);
