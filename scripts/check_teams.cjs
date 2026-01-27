
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkTeams() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const teamSchema = new mongoose.Schema({}, { strict: false });
        const Team = mongoose.models.Team2026 || mongoose.model('Team2026', teamSchema, 'teams_2026');
        const teams = await Team.find({});
        console.log('Teams in DB:');
        teams.forEach(t => console.log(`- ${t.name}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTeams();
