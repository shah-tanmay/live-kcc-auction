
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkRealData() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            return;
        }
        await mongoose.connect(MONGODB_URI);
        
        const playerSchema = new mongoose.Schema({}, { collection: 'players_2026', strict: false });
        const Player = mongoose.models.PlayerCheck || mongoose.model("PlayerCheck", playerSchema);

        // Find any player that IS sold
        const soldPlayers = await Player.find({ isSold: true }).lean();
        console.log(`Found ${soldPlayers.length} sold players`);
        soldPlayers.forEach(p => {
            console.log(`Player: ${p.name}, soldFor: ${p.soldFor} (Type: ${typeof p.soldFor})`);
        });

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkRealData();
