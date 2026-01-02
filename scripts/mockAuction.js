import mongoose from 'mongoose';
import 'dotenv/config';

// Define Schemas Locally for the script
const playerSchema = new mongoose.Schema({
  name: String,
  isSold: { type: Boolean, default: false },
  unSold: { type: Boolean, default: false },
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  soldFor: { type: Number, default: 0 },
  basePrice: { type: Number, default: 4000 }
});

const teamSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  purseLeft: { type: Number, default: 100000 },
  squad: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

async function mockAuction() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/kcc_auction";
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Mock Auction...");

        const isResetOnly = process.argv.includes('--reset-only') || process.argv.includes('--reset');

        // 1. Reset all players to available and set base price to 4000
        await Player.updateMany({}, { 
            isSold: false, 
            unSold: false, 
            soldTo: null, 
            soldFor: 0,
            basePrice: 4000 
        });
        
        // 2. Reset all teams squads and purses
        await Team.updateMany({}, {
            squad: [],
            purseLeft: 100000
        });

        console.log("Reset all players and teams to initial state.");

        if (isResetOnly) {
            console.log("Reset complete. Exiting (--reset-only used).");
            process.exit(0);
        }

        const teams = await Team.find();
        if (teams.length === 0) {
            console.log("No teams found. Please seed teams first.");
            process.exit(1);
        }

        const players = await Player.find();
        console.log(`Processing ${players.length} players...`);

        // Randomly mark 15 players as SOLD
        for (let i = 0; i < 15; i++) {
            const randomIndex = Math.floor(Math.random() * players.length);
            const player = players[randomIndex];
            
            if (!player.isSold) {
                const team = teams[Math.floor(Math.random() * teams.length)];
                player.isSold = true;
                player.soldTo = team._id;
                player.soldFor = player.basePrice + Math.floor(Math.random() * 20000);
                await player.save();
                console.log(`Marked ${player.name} as SOLD to ${team.name}`);
            }
        }

        // Randomly mark 5 players as UNSOLD
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * players.length);
            const player = players[randomIndex];
            
            if (!player.isSold && !player.unSold) {
                player.unSold = true;
                await player.save();
                console.log(`Marked ${player.name} as UNSOLD`);
            }
        }

        console.log("Mock auction data populated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during mock auction:", err);
        process.exit(1);
    }
}

mockAuction();
