
import mongoose from 'mongoose';
import Player2026 from '../lib/models/player2026.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkPlayer() {
    await mongoose.connect(process.env.MONGODB_URI);
    const p = await Player2026.findOne({ name: 'Viren Palesa' });
    console.log(JSON.stringify(p, null, 2));
    await mongoose.disconnect();
}

checkPlayer();
