import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYERS_JSON = path.join(__dirname, "players_seed_data.json");

// Define Schema locally to avoid import issues or just use strict generic
const playerSchema = new mongoose.Schema({
  name: String,
  stats: {
    matches: Number,
    runs: Number,
    wickets: Number,
    avg: Number,
    sr: Number,
    innings: Number,
    economy: Number
  }
}, { collection: 'players_2026', strict: false });

const Player = mongoose.models.Player2026 || mongoose.model('Player2026', playerSchema);

async function updateStatsOnly() {
  console.log("🔄 Starting Safe Stats Update...");
  
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    if (!fs.existsSync(PLAYERS_JSON)) {
      throw new Error(`players_seed_data.json not found at ${PLAYERS_JSON}`);
    }

    const manualStatsData = JSON.parse(fs.readFileSync(PLAYERS_JSON, "utf8"));
    console.log(`📄 Found ${manualStatsData.length} players in override file.`);

    let updatedCount = 0;

    for (const playerOverride of manualStatsData) {
      if (!playerOverride.name) continue;

      const player = await Player.findOne({ name: playerOverride.name });
      
      if (player) {
         // Merge existing stats with new stats
         const currentStats = player.stats || {};
         const newStats = { ...currentStats, ...playerOverride.stats };
         
         // Ensure default 0 for new fields if not present
         if (newStats.innings === undefined) newStats.innings = 0;
         if (newStats.economy === undefined) newStats.economy = 0;

         await Player.updateOne(
           { _id: player._id },
           { $set: { stats: newStats } }
         );
         console.log(`✅ Updated stats for: ${player.name}`);
         updatedCount++;
      } else {
        console.log(`⚠️  Player not found in DB: ${playerOverride.name} (Skipping)`);
      }
    }

    console.log(`\n🎉 Finished! Updated ${updatedCount} players.`);

  } catch (error) {
    console.error("❌ Error updating stats:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

updateStatsOnly();
