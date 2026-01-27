
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

async function fixPurses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const teamsToFix = ['Siddha Strikers', 'House of V.R'];
        
        for (const teamName of teamsToFix) {
            const team = await Team2026.findOne({ name: teamName });
            if (team) {
                console.log(`Fixing ${teamName}: Previous Purse=${team.purseLeft}`);
                team.purseLeft = 200000;
                await team.save();
                console.log(`Updated ${teamName} purse to 200000`);
            } else {
                console.log(`Team ${teamName} not found!`);
                // Try fuzzy search for House of VR
                if (teamName.includes('House')) {
                    const altTeam = await Team2026.findOne({ name: /House/i });
                    if (altTeam) {
                        console.log(`Found alternative for House of VR: ${altTeam.name}`);
                        altTeam.purseLeft = 200000;
                        await altTeam.save();
                        console.log(`Updated ${altTeam.name} purse to 200000`);
                    }
                }
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixPurses();
