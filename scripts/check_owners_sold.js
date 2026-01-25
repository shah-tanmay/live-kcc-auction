
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkOwners() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            return;
        }
        await mongoose.connect(MONGODB_URI);
        
        const playerSchema = new mongoose.Schema({}, { collection: 'players_2026', strict: false });
        const Player = mongoose.models.PlayerSync || mongoose.model("PlayerSync", playerSchema);

        const owners = await Player.find({ name: { $in: ['Viren Palesa', 'Rushubh bora'] } }).lean();
        console.log(JSON.stringify(owners, null, 2));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkOwners();
