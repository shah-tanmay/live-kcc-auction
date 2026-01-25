
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkSiddha() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            return;
        }
        await mongoose.connect(MONGODB_URI);
        
        // Define schemas locally to avoid import issues
        const teamSchema = new mongoose.Schema({}, { collection: 'teams_2026', strict: false });
        const Team = mongoose.models.TeamSync || mongoose.model("TeamSync", teamSchema);

        const t = await Team.findOne({ name: 'Siddha Strikers' }).lean();
        console.log(JSON.stringify(t, null, 2));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkSiddha();
