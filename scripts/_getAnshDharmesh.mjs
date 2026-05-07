import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8"]);
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('players_2026');

const players = await col.find({ 
    $or: [
        { name: { $regex: /ansh/i } },
        { name: { $regex: /dharmesh/i } }
    ]
}).toArray();

console.log(players.map(p => ({ name: p.name, soldFor: p.soldFor, isSold: p.isSold })));

await mongoose.disconnect();
process.exit(0);
