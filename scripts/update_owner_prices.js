
import mongoose from 'mongoose';
import Team2026 from '../lib/models/team2026.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function updatePrices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'teams_2026.json'), 'utf8'));

        for (const teamData of teamsData) {
            const updates = {};
            if (teamData.ownerValuation !== undefined) {
                updates.ownerValuation = teamData.ownerValuation;
            }
            if (teamData.ownerValuations !== undefined) {
                updates.ownerValuations = teamData.ownerValuations;
            }

            if (Object.keys(updates).length > 0) {
                const result = await Team2026.updateOne(
                    { name: teamData.name },
                    { $set: updates }
                );
                console.log(`Updated ${teamData.name}: ${JSON.stringify(updates)} (Matched: ${result.matchedCount})`);
            }
        }

        console.log('\n✅ Owner prices synced successfully!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

updatePrices();
