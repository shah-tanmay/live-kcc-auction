import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectToDB from "../lib/db.js";
import Player2026 from "../lib/models/player2026.js";
import Team2026 from "../lib/models/team2026.js";
import MockPlayer from "../lib/models/mockPlayer.js";
import MockTeam from "../lib/models/mockTeam.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect mode from command line arguments
const isMockMode = process.argv.includes("--mock");

// Configuration
const EXCEL_FILE = path.join(__dirname, "..", "KCC Tournament Season #5 (Responses).xlsx");
const TEAMS_JSON = path.join(__dirname, "teams_2026.json");
const PLAYERS_JSON = path.join(__dirname, "players_seed_data.json");

// Select appropriate models based on mode
// Mock mode: Use standard mock collections (mock_players, mock_teams)
// Real mode: Use 2026 collections (players_2026, teams_2026)
const PlayerModel = isMockMode ? MockPlayer : Player2026;
const TeamModel = isMockMode ? MockTeam : Team2026;



// Excel Column Mappings
const COLUMN_MAP = {
  name: "Player Name",
  photoUrl: "Player Photo",
  age: "Player Age",
  battingHand: "Players Dominant Batting Hand",
  bowlingHand: "Players Dominant Bowling Hand",
  role: "Role",
  favTeam: "Which is your favorite team?",
};

// Role normalization mapping
const ROLE_MAP = {
  "allrounder": "AllRounder",
  "all-rounder": "AllRounder",
  "all rounder": "AllRounder",
  "batsman": "Batsmen",
  "batsmen": "Batsmen",
  "batter": "Batsmen",
  "bowler": "Bowler",
  "wicketkeeper": "Wicketkeeper",
  "wicket keeper": "Wicketkeeper",
  "wk": "Wicketkeeper",
};

// Helper to parse batting style
function parseBattingStyle(raw) {
  const norm = normalize(raw);
  if (norm.includes('left')) return 'Left';
  return 'Right';
}

// Helper to parse bowling style
function parseBowlingStyle(raw) {
  const norm = normalize(raw);
  if (norm.includes('left')) return 'Left';
  return 'Right';
}

/**
 * Normalize a string value (trim, lowercase)
 */
function normalize(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}


/**
 * Clean favorite team name by removing bracketed content
 * "AJ TURF TITANS (OWNER: AKSHAY JAIN)" -> "AJ TURF TITANS"
 */
function cleanFavTeam(teamName) {
  if (!teamName) return "";
  // Remove anything in parentheses and trim whitespace
  return teamName.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Generate photo URL from player name
 * Converts "John Doe" -> "/players/johndoe.jpg"
 */
function generatePhotoUrl(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `/players/${cleanName}.jpg`;
}

/**
 * Load manual player stats override from JSON
 */
function loadManualStats() {
  if (!fs.existsSync(PLAYERS_JSON)) {
    console.warn(`⚠️  Manual stats file not found: ${PLAYERS_JSON}`);
    return {};
  }

  try {
    const raw = fs.readFileSync(PLAYERS_JSON, "utf8");
    const players = JSON.parse(raw);
    const statsMap = {};

    players.forEach(p => {
      if (p.name && p.stats) {
        // Use normalized name as key for lookup
        statsMap[normalize(p.name)] = p.stats;
      }
    });

    console.log(`✅ Loaded manual stats for ${Object.keys(statsMap).length} players from JSON`);
    return statsMap;
  } catch (err) {
    console.error(`❌ Failed to load manual stats from JSON: ${err.message}`);
    return {};
  }
}

/**
 * Fetch sold players from last season (Player collection)
 */
async function fetchHistoricalData() {
  console.log("\n📡 Fetching historical auction data from MongoDB...");
  try {
    const soldPlayers = await Player.find({ isSold: true }).populate("soldTo");
    const historyMap = {};

    soldPlayers.forEach(p => {
      // Even if soldTo is missing (broken reference), if they have a price, we want it.
      if (p.name && (p.soldTo || p.soldFor > 0)) {
        historyMap[normalize(p.name)] = {
          price: p.soldFor,
          team: p.soldTo ? p.soldTo.name : 'Unknown Team',
          photoUrl: p.photoUrl
        };
      }
    });

    console.log(`✅ Found historical data for ${Object.keys(historyMap).length} players`);
    return historyMap;
  } catch (err) {
    console.error(`❌ Failed to fetch historical data: ${err.message}`);
    return {};
  }
}

/**
 * Parse Excel file and extract player data
 */
function parseExcelFile(filePath, historyMap = {}) {
  console.log(`\n📄 Reading Excel file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log(`✅ Found ${data.length} rows in Excel file`);

  // Load manual stats lookup map
  const manualStatsMap = loadManualStats();

  const players = [];
  const errors = [];
  const seenNames = new Set();

  data.forEach((row, index) => {
    const rowNum = index + 2; // Excel row number (1-indexed + header)

    try {
      // Extract and validate player name
      const name = row[COLUMN_MAP.name]?.trim();
      if (!name) {
        errors.push(`Row ${rowNum}: Missing player name`);
        return;
      }

      // Check for duplicates
      if (seenNames.has(name.toLowerCase())) {
        console.warn(`⚠️  Row ${rowNum}: Duplicate player "${name}" skipped`);
        return;
      }
      seenNames.add(name.toLowerCase());

      // Extract role and normalize
      const rawRole = row[COLUMN_MAP.role];
      const normalizedRole = normalize(rawRole);
      const role = ROLE_MAP[normalizedRole] || "AllRounder";
      
      if (!ROLE_MAP[normalizedRole]) {
        console.warn(`⚠️  Row ${rowNum}: Unknown role "${rawRole}", defaulting to AllRounder`);
      }

      // Parse Batting Hand (Robust)
      const rawBattingHand = row[COLUMN_MAP.battingHand];
      const battingHand = parseBattingStyle(rawBattingHand);

      // Parse Bowling Hand (Robust)
      const rawBowlingHand = row[COLUMN_MAP.bowlingHand];
      const bowlingHand = parseBowlingStyle(rawBowlingHand);

      // Extract favorite team and clean it (remove bracketed content)
      const rawFavTeam = row[COLUMN_MAP.favTeam]?.trim() || "";
      const favTeam = cleanFavTeam(rawFavTeam);

      // Map base price
      const basePrice = 4000;

      // Get manual stats override if available
      const normalizedName = normalize(name);

      // Photo URL - ALWAYS use Google Drive URL from Excel
      const driveUrl = row[COLUMN_MAP.photoUrl]?.trim();
      let photoUrl = '';
      
      if (driveUrl && driveUrl.includes("drive.google.com")) {
        let fileId = null;
        const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          fileId = fileIdMatch[1];
        } else {
          const idParamMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idParamMatch && idParamMatch[1]) {
            fileId = idParamMatch[1];
          }
        }
        if (fileId) {
          // Reverting to lh3 format as requested by user
          photoUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
          console.log(`📷 Photo: ${name} -> ${driveUrl} -> ID: ${fileId} -> ${photoUrl}`);
        } else {
             console.warn(`⚠️  No File ID found for ${name}: ${driveUrl}`);
        }
      } else if (driveUrl) {
          console.warn(`⚠️  Invalid Drive URL for ${name}: ${driveUrl}`);
      }

      const manualStats = manualStatsMap[normalizedName] || {};

      // Create player object
      const player = {
        name,
        role,
        photoUrl,
        battingHand,
        bowlingHand,
        favTeam,
        basePrice,
        stats: {
          matches: manualStats.matches || 0,
          runs: manualStats.runs || 0,
          wickets: manualStats.wickets || 0,
          avg: manualStats.avg || 0,
          sr: manualStats.sr || 0,
          innings: manualStats.innings || 0,
          economy: manualStats.economy || 0,
        },
        unSold: false,
        isSold: false,
        soldTo: null,
        soldFor: 0,
        lastYearSoldPrice: historyMap[normalizedName]?.price || 0,
        lastYearSoldTeam: historyMap[normalizedName]?.team || '',
      };

      // Debug history matching for specific users
      if (name.toLowerCase().includes("rushabh") || name.toLowerCase().includes("chirag") || name.toLowerCase().includes("parth")) {
        console.log(`\n🔍 Debug History Match for "${name}" (Normalized: "${normalizedName}"):`);
        if (historyMap[normalizedName]) {
           console.log(`   ✅ Match Found! Price: ${historyMap[normalizedName].price}`);
        } else {
           console.log(`   ❌ No Match Found.`);
           // Try to find close matches in historyMap keys
           const keys = Object.keys(historyMap);
           const closeMatches = keys.filter(k => k.includes(normalizedName.split(" ")[0]));
           console.log(`   ❓ Potential matches in DB: ${closeMatches.join(", ")}`);
        }
      }

      if (Object.keys(manualStats).length > 0) {
        console.log(`✨ Applied manual stats override for: ${name}`);
      }

      players.push(player);
    } catch (error) {
      errors.push(`Row ${rowNum}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    console.error("\n❌ Errors found while parsing Excel:");
    errors.forEach((err) => console.error(`   ${err}`));
    throw new Error(`Failed to parse Excel file: ${errors.length} errors found`);
  }

  console.log(`✅ Successfully parsed ${players.length} players`);
  
  // Limit to first 72 players
  const limitedPlayers = players.slice(0, 72);
  if (players.length > 72) {
    console.log(`⚠️  Limiting to first 72 players (dropped ${players.length - 72} players)`);
  }
  
  return limitedPlayers;
}

/**
 * Parse teams JSON file
 */
function parseTeamsJSON(filePath) {
  console.log(`\n📄 Reading teams JSON: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Teams JSON file not found: ${filePath}`);
  }

  const data = fs.readFileSync(filePath, "utf8");
  const teams = JSON.parse(data);

  // Validate teams
  teams.forEach((team, index) => {
    if (!team.name) {
      throw new Error(`Team at index ${index}: Missing name`);
    }
    if (!team.logoUrl) {
      throw new Error(`Team "${team.name}": Missing logoUrl`);
    }
    
    // Set defaults
    team.motto = team.motto || "";
    team.owner = team.owner || "";
    team.purseLeft = team.purseLeft || 100000;
    team.squad = [];
  });

  console.log(`✅ Successfully parsed ${teams.length} teams`);
  return teams;
}

/**
 * Main seeding function
 */
async function seed2026() {
  const isDryRun = process.argv.includes("--dry-run");
  const isReset = process.argv.includes("--reset");
  const isVerbose = process.argv.includes("--verbose");

  console.log("\n🌱 KCC Tournament 2026 - Database Seeding Script");
  console.log("=".repeat(50));
  console.log(`📍 Mode: ${isMockMode ? "MOCK" : "REAL"}`);
  console.log(`📦 Collections: ${isMockMode ? "mock_players, mock_teams" : "players_2026, teams_2026"}`);
  
  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No data will be written to database");
  }

  try {
    // Connect to database first to fetch historical data
    console.log("\n🔌 Connecting to MongoDB...");
    await connectToDB();
    console.log("✅ Connected to database");

    // Fetch historical data
    const historyMap = await fetchHistoricalData();

    // Parse data files
    const players = parseExcelFile(EXCEL_FILE, historyMap);
    const teams = parseTeamsJSON(TEAMS_JSON);

    // Adjust purse for mock mode
    // Adjust purse for all modes (Real & Mock)
    teams.forEach(team => {
      team.purseLeft = 200000;
    });

    // Display summary
    console.log("\n📊 Data Summary:");
    console.log(`   Teams: ${teams.length}`);
    console.log(`   Players: ${players.length}`);
    console.log(`   Team Purse: ₹2,00,000`);
    
    if (isVerbose) {
      console.log("\n📋 Teams:");
      teams.forEach((team) => {
        console.log(`   - ${team.name}${team.motto ? ` (${team.motto})` : ""} - Owner: ${team.owner || "Not specified"}`);
      });
      
      console.log("\n📋 Player Roles Distribution:");
      const roleCount = {};
      players.forEach((p) => {
        roleCount[p.role] = (roleCount[p.role] || 0) + 1;
      });
      Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
    }

    if (isDryRun) {
      console.log("\n✅ Dry run completed successfully!");
      console.log("   Run without --dry-run to seed the database");
      console.log(`   Add --mock flag to seed mock collections`);
      process.exit(0);
    }

    // Connect to database
    // (Already connected above)

    // Clear existing data if reset flag is set
    if (isReset) {
      console.log("\n🗑️  Clearing existing 2026 data...");
      await PlayerModel.deleteMany({});
      await TeamModel.deleteMany({});
      console.log(`✅ Cleared ${isMockMode ? "mock" : "real"} 2026 collections`);
    }

    // Insert teams
    console.log("\n📥 Inserting teams...");
    const insertedTeams = await TeamModel.insertMany(teams);
    console.log(`✅ Inserted ${insertedTeams.length} teams`);

    // Insert players
    console.log("\n📥 Inserting players...");
    const insertedPlayers = await PlayerModel.insertMany(players);
    console.log(`✅ Inserted ${insertedPlayers.length} players`);

    // Final summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seeding completed successfully!");
    console.log("=".repeat(50));
    console.log(`   Mode: ${isMockMode ? "MOCK" : "REAL"}`);
    console.log(`   Teams created: ${insertedTeams.length}`);
    console.log(`   Players created: ${insertedPlayers.length}`);
    console.log(`   Collections: ${isMockMode ? "mock_players, mock_teams" : "players_2026, teams_2026"}`);
    console.log("\n💡 Next steps:");
    console.log("   1. Verify data in MongoDB");
    console.log("   2. Download player photos from Google Drive");
    console.log("   3. Place photos in /public/players/ directory");
    if (!isMockMode) {
      console.log("   4. Update app to use 2026 models (Player2026, Team2026)");
      console.log("   5. Or run with --mock flag to seed mock data for testing");
    } else {
      console.log("   4. Set NEXT_PUBLIC_MOCK_MODE=true to test with mock data");
      console.log("   5. Update app to use 2026 models when ready");
    }
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:");
    console.error(`   ${error.message}`);
    if (isVerbose) {
      console.error("\n📚 Stack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the seeding script
seed2026();
