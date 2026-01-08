import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXISTING_STATS_FILE = path.join(__dirname, "players_seed_data.json");
const OUTPUT_FILE = path.join(__dirname, "missing_stats_players.json");

// Define loose schema to work with both collections
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
}, { strict: false });

async function generateMissingStats() {
  console.log("🔍 Finding players with missing stats...");

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Load existing seed data to exclude already handled players
    const existingNames = new Set();
    if (fs.existsSync(EXISTING_STATS_FILE)) {
      const existingData = JSON.parse(fs.readFileSync(EXISTING_STATS_FILE, "utf8"));
      existingData.forEach(p => {
        if (p.name) existingNames.add(normalize(p.name));
      });
      console.log(`📚 Loaded ${existingNames.size} existing players from seed data`);
    } else {
      console.warn(`⚠️ Warning: ${EXISTING_STATS_FILE} not found. No players excluded.`);
    }

    // 2. Fetch players from both collections
    const MockPlayer = mongoose.model('mock_player', playerSchema, 'mock_players');
    const RealPlayer = mongoose.model('player_2026', playerSchema, 'players_2026');

    const mockPlayers = await MockPlayer.find({});
    const realPlayers = await RealPlayer.find({});
    
    console.log(`📊 Found ${mockPlayers.length} mock players and ${realPlayers.length} real players in DB`);

    const allPlayers = [...mockPlayers, ...realPlayers];
    const missingStatsPlayers = [];
    const processedNames = new Set(); // To avoid duplicates in output

    for (const player of allPlayers) {
      if (!player.name) continue;

      const normalizedName = normalize(player.name);

      // Skip if we already have stats for this player in our local file
      if (existingNames.has(normalizedName)) continue;

      // Skip if we already added this player to the output list (duplicates in DB)
      if (processedNames.has(normalizedName)) continue;

      // Check if stats are missing or matches is 0/null
      const stats = player.stats || {};
      const hasStats = stats.matches && stats.matches > 0;

      if (!hasStats) {
        missingStatsPlayers.push({
          name: player.name,
          stats: {
            matches: 0,
            runs: 0,
            wickets: 0,
            avg: 0,
            sr: 0,
            innings: 0,
            economy: 0
          }
        });
        processedNames.add(normalizedName);
      }
    }

    console.log(`📝 Found ${missingStatsPlayers.length} players needing stats.`);

    // 3. Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(missingStatsPlayers, null, 4));
    console.log(`✅ Should be saved to: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

function normalize(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

generateMissingStats();
