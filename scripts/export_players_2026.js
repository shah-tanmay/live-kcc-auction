
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function exportPlayers() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            return;
        }
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        
        // Define simple schema to access the collection
        const playerSchema = new mongoose.Schema({
            name: String
        }, { collection: 'players_2026', strict: false });
        
        // Use a unique model name to avoid compilation errors if run multiple times in same context (though unlikely here)
        const Player = mongoose.models.PlayerExport2026 || mongoose.model("PlayerExport2026", playerSchema);

        const players = await Player.find({}).sort({ name: 1 }).lean();
        
        console.log(`Found ${players.length} players.`);

        const displayStrings = players.map(p => p.name).filter(Boolean);
        
        const content = displayStrings.join('\n');
        const outputPath = path.resolve(__dirname, '../players_list_2026.txt');
        
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Successfully wrote ${displayStrings.length} player names to ${outputPath}`);
        
        await mongoose.disconnect();
    } catch (e) {
        console.error("Error exporting players:", e);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

exportPlayers();
