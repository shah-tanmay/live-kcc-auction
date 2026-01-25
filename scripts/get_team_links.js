
import mongoose from 'mongoose';
import Team2026 from '../lib/models/team2026.js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI in .env.local");
    process.exit(1);
}

const toSlug = (name) => {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-|-$/g, '');      // Trim leading/trailing hyphens
};

async function getTeamLinks() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const teams = await Team2026.find({});

        console.log('\n=== TEAM REVEAL LINKS ===');
        teams.forEach(team => {
            const slug = toSlug(team.name);
            console.log(`Team: ${team.name}`);
            console.log(`Link: http://localhost:3000/reveal/${slug} \n`);
        });
        console.log('=========================\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

getTeamLinks();
