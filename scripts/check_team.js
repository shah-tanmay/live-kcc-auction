
import mongoose from 'mongoose';
import Team2026 from '../lib/models/team2026.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkTeam() {
    await mongoose.connect(process.env.MONGODB_URI);
    const t = await Team2026.findOne({ name: 'House of V.R' });
    console.log(JSON.stringify(t, null, 2));
    await mongoose.disconnect();
}

checkTeam();
