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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect mode from command line arguments
const isMockMode = process.argv.includes("--mock");

// Configuration
const EXCEL_FILE = path.join(__dirname, "..", "KCC Tournament Season #5 (Responses).xlsx");
const TEAMS_JSON = path.join(__dirname, "teams_2026.json");

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

// Batting hand normalization
const BATTING_HAND_MAP = {
  "right": "Right",
  "left": "Left",
  "right hand": "Right",
  "left hand": "Left",
  "right handed": "Right",
  "left handed": "Left",
};

// Bowling hand normalization
const BOWLING_HAND_MAP = {
  "right arm fast": "Right-arm Fast",
  "right-arm fast": "Right-arm Fast",
  "right fast": "Right-arm Fast",
  "fast": "Right-arm Fast",
  "right arm spin": "Right-arm Spin",
  "right-arm spin": "Right-arm Spin",
  "right spin": "Right-arm Spin",
  "spin": "Right-arm Spin",
  "left arm fast": "Left-arm Fast",
  "left-arm fast": "Left-arm Fast",
  "left fast": "Left-arm Fast",
  "left arm spin": "Left-arm Spin",
  "left-arm spin": "Left-arm Spin",
  "left spin": "Left-arm Spin",
};

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
 * Parse Excel file and extract player data
 */
function parseExcelFile(filePath) {
  console.log(`\n📄 Reading Excel file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log(`✅ Found ${data.length} rows in Excel file`);

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

      // Extract batting hand and normalize
      const rawBattingHand = row[COLUMN_MAP.battingHand];
      const normalizedBattingHand = normalize(rawBattingHand);
      const battingHand = BATTING_HAND_MAP[normalizedBattingHand] || "Right";

      // Extract bowling hand and normalize
      const rawBowlingHand = row[COLUMN_MAP.bowlingHand];
      const normalizedBowlingHand = normalize(rawBowlingHand);
      const bowlingHand = BOWLING_HAND_MAP[normalizedBowlingHand] || "Right-arm Fast";

      // Extract photo URL
      let photoUrl = row[COLUMN_MAP.photoUrl]?.trim();
      
      // Transform Google Drive links to direct viewable format
      // From: https://drive.google.com/file/d/FILE_ID/view
      // To: https://lh3.googleusercontent.com/d/FILE_ID
      if (photoUrl && photoUrl.includes("drive.google.com")) {
        let fileId = null;
        // Try to match /d/FILE_ID format
        const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
           fileId = fileIdMatch[1];
        } else {
           // Try to match id=FILE_ID format
           const idParamMatch = photoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
           if (idParamMatch && idParamMatch[1]) {
               fileId = idParamMatch[1];
           }
        }

        if (fileId) {
           photoUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        } else {
           // Fallback if regex fails but it is a drive link
           console.warn(`⚠️  Row ${rowNum}: Could not extract ID from Drive link: ${photoUrl}`);
           photoUrl = generatePhotoUrl(name);
        }
      } else if (!photoUrl) {
        // Only generate local path if no URL provided
        photoUrl = generatePhotoUrl(name);
      }
      // If it's not a drive link and not empty, we assume it's a valid URL or path already

      // Extract favorite team and clean it (remove bracketed content)
      const rawFavTeam = row[COLUMN_MAP.favTeam]?.trim() || "";
      const favTeam = cleanFavTeam(rawFavTeam);

      // Create player object
      const player = {
        name,
        role,
        photoUrl,
        battingHand,
        bowlingHand,
        favTeam,
        basePrice: 4000, // Default base price
        stats: {
          matches: 0,
          runs: 0,
          wickets: 0,
          avg: 0,
          sr: 0,
        },
        unSold: false,
        isSold: false,
        soldTo: null,
        soldFor: 0,
      };

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
  return players;
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
    // Parse data files
    const players = parseExcelFile(EXCEL_FILE);
    const teams = parseTeamsJSON(TEAMS_JSON);

    // Adjust purse for mock mode
    if (isMockMode) {
      teams.forEach(team => {
        team.purseLeft = 200000; // Mock mode default
      });
    }

    // Display summary
    console.log("\n📊 Data Summary:");
    console.log(`   Teams: ${teams.length}`);
    console.log(`   Players: ${players.length}`);
    console.log(`   Team Purse: ${isMockMode ? "₹2,00,000" : "₹1,00,000"}`);
    
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
    console.log("\n🔌 Connecting to MongoDB...");
    await connectToDB();
    console.log("✅ Connected to database");

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
