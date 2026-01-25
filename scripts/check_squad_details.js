
import mongoose from 'mongoose';
import connectToDB from '../lib/db.js';
import { getModel } from '../lib/getModel.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSquad() {
    await connectToDB();
    const Team = getModel('Team');
    const teams = await Team.find().populate("squad").lean();
    
    teams.forEach(t => {
        console.log(`Team: ${t.name}`);
        t.squad.forEach(p => {
            console.log(`  - Player: ${p.name}, isSold: ${p.isSold}, soldFor: ${p.soldFor}, soldTo: ${p.soldTo}`);
        });
    });
    
    await mongoose.disconnect();
}

checkSquad();
