
import mongoose from 'mongoose';
import Team2026 from '../lib/models/team2026.js';
import Player2026 from '../lib/models/player2026.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI in .env.local");
    process.exit(1);
}

async function fixHouseOfVR() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Update Team Owner String
        const team = await Team2026.findOne({ name: 'House of V.R' });
        if (team) {
            console.log(`Found Team: ${team.name}, Current Owner: ${team.owner}`);
            team.owner = "Viren Palesa, Rushubh bora";
            await team.save();
            console.log(`Updated Team Owner to: ${team.owner}`);
        } else {
            console.log('Team "House of V.R" not found!');
        }

        // 2. Check Players
        const owner1 = await Player2026.findOne({ name: { $regex: /^Viren Palesa$/i } });
        const owner2 = await Player2026.findOne({ name: { $regex: /^Rushubh bora$/i } });

        console.log('\n--- Player Check ---');
        console.log(`Viren Palesa: ${owner1 ? 'Found' : 'Not Found'} - Photo: ${owner1?.photoUrl}`);
        console.log(`Rushubh bora: ${owner2 ? 'Found' : 'Not Found'} - Photo: ${owner2?.photoUrl}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixHouseOfVR();
