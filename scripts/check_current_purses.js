
import mongoose from 'mongoose';
import Team2026 from '../lib/models/team2026.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI in .env.local");
    process.exit(1);
}

async function checkPurses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const teams = await Team2026.find({});
        console.log('\n--- Current Purses ---');
        teams.forEach(team => {
            console.log(`${team.name}: Purse=${team.purseLeft}, Valuation=${team.ownerValuation}, Revealed=${team.isRevealed}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPurses();
