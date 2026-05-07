/**
 * seedMiniS1.js
 * Seeds the KCC Mini Tournament Season 1 database.
 *
 * Usage:
 *   node --experimental-vm-modules scripts/seedMiniS1.js
 *   node --experimental-vm-modules scripts/seedMiniS1.js --dry-run
 *   node --experimental-vm-modules scripts/seedMiniS1.js --reset
 *   node --experimental-vm-modules scripts/seedMiniS1.js --reset --dry-run
 *
 * Outputs:
 *   scripts/mini_s1_no_stats.json       — players with NO stats found (exact or fuzzy)
 *   scripts/mini_s1_fuzzy_matches.json  — players whose stats came from a FUZZY name match (needs human verification)
 */

import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectToDB from "../lib/db.js";
import PlayerMiniS1 from "../lib/models/playerMiniS1.js";
import TeamMiniS1 from "../lib/models/teamMiniS1.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── File paths ──────────────────────────────────────────────────────────────
const EXCEL_FILE  = path.join(__dirname, "..", "KCC Mini Tournament Season #1 (Responses).xlsx");
const TEAMS_JSON  = path.join(__dirname, "teams_mini_s1.json");
const STATS_JSON  = path.join(__dirname, "players_seed_data.json"); // existing stats DB
const NO_STATS_OUT    = path.join(__dirname, "mini_s1_no_stats.json");
const FUZZY_MATCH_OUT = path.join(__dirname, "mini_s1_fuzzy_matches.json");

// ─── Exclusions ───────────────────────────────────────────────────────────────
// Players who submitted the form but should NOT be in the auction pool.
const EXCLUDED_PLAYERS = new Set([
  "ricky jain", // removed per admin decision
]);

// ─── Manual Additions ─────────────────────────────────────────────────────────
// Players not in the Google Form (e.g. added from 2026 tournament roster).
// Stats will be looked up from players_seed_data.json using the same fuzzy logic.
const MANUAL_PLAYERS = [
  {
    name: "Kumar Waghresha",
    role: "AllRounder",
    battingHand: "Right",
    bowlingHand: "Right",
    favTeam: "",
    jerseySize: "",
    phoneNumber: "",
    photoUrl: "https://lh3.googleusercontent.com/d/1aQRKE5jTasxfxizgfqpnwjYKvXUf2zkr",  // 2026 DB Photo
  },
  {
    name: "RJ",
    role: "AllRounder",
    battingHand: "Right",
    bowlingHand: "Right",
    favTeam: "AJ TURF TITANS",
    jerseySize: "",
    phoneNumber: "",
  },
  {
    name: "Dynano (RJ) bhai",
    role: "AllRounder",
    battingHand: "Right",
    bowlingHand: "Right",
    favTeam: "AJ TURF TITANS",
    jerseySize: "",
    phoneNumber: "",
  },
];

// ─── Excel Column Names ───────────────────────────────────────────────────────
const COL = {
  name:       "Player Name",
  photo:      "Player Photo",
  phone:      "Phone Number",
  age:        "Player Age",
  batting:    "Players Dominant Batting Hand",
  bowling:    "Players Dominant Bowling Hand",
  role:       "Role",
  jersey:     "Select Your Jersey Size",
  favTeam:    "Which is your favorite team?",
};

// ─── Role normalisation ───────────────────────────────────────────────────────
const ROLE_MAP = {
  "allrounder":  "AllRounder",
  "all-rounder": "AllRounder",
  "all rounder": "AllRounder",
  "batsman":     "Batsmen",
  "batsmen":     "Batsmen",
  "batter":      "Batsmen",
  "bowler":      "Bowler",
  "wicketkeeper":"Wicketkeeper",
  "wicket keeper":"Wicketkeeper",
  "wk":          "Wicketkeeper",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalize(v) {
  if (!v) return "";
  return String(v).trim().toLowerCase();
}

function parseBattingStyle(raw) {
  return normalize(raw).includes("left") ? "Left" : "Right";
}

function parseBowlingStyle(raw) {
  return normalize(raw).includes("left") ? "Left" : "Right";
}

function cleanFavTeam(raw) {
  if (!raw) return "";
  return String(raw).replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Convert a Google Drive share URL → direct lh3 image URL.
 *
 * Supported formats:
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/file/d/FILE_ID/view
 *   https://drive.google.com/uc?id=FILE_ID
 */
function driveUrlToPhoto(raw) {
  if (!raw) return "";
  const url = String(raw).trim();
  if (!url.includes("drive.google.com")) return "";

  let fileId = null;

  // Format: /d/FILE_ID/
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) fileId = dMatch[1];

  // Format: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) fileId = idMatch[1];
  }

  if (!fileId) {
    console.warn(`  ⚠️  Could not extract file ID from: ${url}`);
    return "";
  }

  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

// ─── Fuzzy matching ───────────────────────────────────────────────────────────
/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Similarity ratio — higher is better.
 */
function similarity(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

/**
 * Returns the best matching entry from the stats map, or null.
 * @param {string} name        - normalized player name from Excel
 * @param {Object} statsMap    - { normalizedName: stats }
 * @param {number} threshold   - minimum similarity to accept (0–1)
 */
function fuzzyFindStats(name, statsMap, threshold = 0.75) {
  // 1. Exact match
  if (statsMap[name]) {
    return { stats: statsMap[name], matchedName: name, confidence: "exact" };
  }

  // 2. Containment — one string fully contains the other
  //    Catches "Sangram" matching "Sangram Xyz", or whitespace mismatches
  for (const key of Object.keys(statsMap)) {
    const norm = normalize(key);
    if (norm === name) {
      return { stats: statsMap[key], matchedName: key, confidence: "exact" };
    }
    if (norm.includes(name) || name.includes(norm)) {
      return { stats: statsMap[key], matchedName: key, confidence: "fuzzy" };
    }
  }

  // 3. Token overlap — split both into words, check if all tokens of the
  //    shorter name appear in the longer (e.g. "Gaurav Sarani" in "Gaurav Rajkumar Sarani")
  const nameTokens = new Set(name.split(/\s+/).filter(Boolean));
  for (const key of Object.keys(statsMap)) {
    const norm = normalize(key);
    const keyTokens = norm.split(/\s+/).filter(Boolean);
    // All tokens from the shorter must appear in the longer
    const shorter = nameTokens.size <= keyTokens.length ? nameTokens : new Set(keyTokens);
    const longerArr = nameTokens.size <= keyTokens.length ? keyTokens : [...nameTokens];
    const allMatch = [...shorter].every(t => longerArr.includes(t));
    if (allMatch && shorter.size >= 2) {
      return { stats: statsMap[key], matchedName: key, confidence: "fuzzy" };
    }
  }

  // 4. Levenshtein similarity
  let bestKey = null, bestScore = 0;
  for (const key of Object.keys(statsMap)) {
    const norm = normalize(key);
    const score = similarity(name, norm);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  if (bestScore >= threshold && bestKey) {
    return { stats: statsMap[bestKey], matchedName: bestKey, confidence: "fuzzy" };
  }

  return null;
}

// ─── Load stats DB ────────────────────────────────────────────────────────────
function loadStatsDB() {
  if (!fs.existsSync(STATS_JSON)) {
    console.warn(`⚠️  Stats file not found: ${STATS_JSON}`);
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(STATS_JSON, "utf8"));
  const map = {};
  raw.forEach(p => {
    if (p.name && p.stats) {
      // Last entry wins for duplicate names in the JSON
      map[normalize(p.name)] = p.stats;
    }
  });
  console.log(`✅ Stats reference DB loaded: ${Object.keys(map).length} entries available for matching`);
  return map;
}

// ─── Parse Excel ──────────────────────────────────────────────────────────────
function parseExcel(statsMap) {
  console.log(`\n📄 Reading Excel: ${EXCEL_FILE}`);
  if (!fs.existsSync(EXCEL_FILE)) throw new Error(`Excel not found: ${EXCEL_FILE}`);

  const wb = xlsx.readFile(EXCEL_FILE);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);
  console.log(`✅ ${rows.length} rows found`);

  const players = [];
  const seenNames = new Set();
  const noStats = [];
  const fuzzyMatches = [];

  rows.forEach((row, idx) => {
    const rawName = row[COL.name]?.trim();
    if (!rawName) {
      console.warn(`  ⚠️  Row ${idx + 2}: missing name — skipped`);
      return;
    }

    // De-duplicate (case-insensitive)
    const nameKey = normalize(rawName);
    if (seenNames.has(nameKey)) {
      console.warn(`  ⚠️  Duplicate entry for "${rawName}" — skipped`);
      return;
    }

    // Exclusion list
    if (EXCLUDED_PLAYERS.has(nameKey)) {
      console.log(`  🚫 Excluded: "${rawName}"`);
      return;
    }

    seenNames.add(nameKey);

    // Role
    const rawRole = row[COL.role];
    const role = ROLE_MAP[normalize(rawRole)] || "AllRounder";

    // Hands
    const battingHand = parseBattingStyle(row[COL.batting]);
    const bowlingStyle = parseBowlingStyle(row[COL.bowling]);

    // Fav team — strip "(OWNER: ...)"
    const favTeam = cleanFavTeam(row[COL.favTeam] || "");

    // Photo URL
    const rawPhoto = row[COL.photo]?.trim() || "";
    const photoUrl = driveUrlToPhoto(rawPhoto);
    if (rawPhoto && !photoUrl) {
      console.warn(`  ⚠️  Bad photo URL for "${rawName}": ${rawPhoto}`);
    } else if (photoUrl) {
      console.log(`  📷 ${rawName} → ${photoUrl}`);
    }

    // Phone
    const phoneNumber = String(row[COL.phone] || "").trim();

    // Jersey
    const jerseySize = String(row[COL.jersey] || "").trim();

    // Stats (fuzzy)
    const matchResult = fuzzyFindStats(nameKey, statsMap);
    let stats, statsMatchedFrom, statsMatchConfidence;

    if (matchResult) {
      stats = {
        matches:  matchResult.stats.matches  || 0,
        runs:     matchResult.stats.runs     || 0,
        wickets:  matchResult.stats.wickets  || 0,
        avg:      matchResult.stats.avg      || 0,
        sr:       matchResult.stats.sr       || 0,
        innings:  matchResult.stats.innings  || 0,
        economy:  matchResult.stats.economy  || 0,
      };
      statsMatchedFrom = matchResult.matchedName;
      statsMatchConfidence = matchResult.confidence;

      if (matchResult.confidence === "fuzzy") {
        console.log(`  🔍 Fuzzy match: "${rawName}" ← "${matchResult.matchedName}" (stats assigned)`);
        fuzzyMatches.push({
          playerName: rawName,
          matchedStatsName: matchResult.matchedName,
          stats,
        });
      } else {
        console.log(`  ✅ Exact match: "${rawName}"`);
      }
    } else {
      stats = { matches: 0, runs: 0, wickets: 0, avg: 0, sr: 0, innings: 0, economy: 0 };
      statsMatchedFrom = "";
      statsMatchConfidence = "none";
      console.log(`  ❌ No stats found for "${rawName}"`);
      noStats.push({ name: rawName, phone: phoneNumber, stats: { matches: 0, runs: 0, wickets: 0, avg: 0, sr: 0, innings: 0, economy: 0 } });
    }

    players.push({
      name: rawName,
      role,
      photoUrl,
      phoneNumber,
      jerseySize,
      battingHand,
      bowlingHand: bowlingStyle,
      favTeam,
      basePrice: 4000,
      stats,
      statsMatchedFrom,
      statsMatchConfidence,
      unSold: false,
      isSold: false,
      soldTo: null,
      soldFor: 0,
      lastYearSoldPrice: 0,
      lastYearSoldTeam: "",
    });
  });

  // ─── Manual additions ──────────────────────────────────────────────────────
  if (MANUAL_PLAYERS.length > 0) {
    console.log(`\n➕ Processing ${MANUAL_PLAYERS.length} manually-added player(s)...`);
    MANUAL_PLAYERS.forEach(mp => {
      const nameKey = normalize(mp.name);
      if (seenNames.has(nameKey)) {
        console.warn(`  ⚠️  Manual player "${mp.name}" already exists — skipped`);
        return;
      }
      seenNames.add(nameKey);

      const matchResult = fuzzyFindStats(nameKey, statsMap);
      let stats, statsMatchedFrom, statsMatchConfidence;

      if (matchResult) {
        stats = {
          matches:  matchResult.stats.matches  || 0,
          runs:     matchResult.stats.runs     || 0,
          wickets:  matchResult.stats.wickets  || 0,
          avg:      matchResult.stats.avg      || 0,
          sr:       matchResult.stats.sr       || 0,
          innings:  matchResult.stats.innings  || 0,
          economy:  matchResult.stats.economy  || 0,
        };
        statsMatchedFrom = matchResult.matchedName;
        statsMatchConfidence = matchResult.confidence;
        if (matchResult.confidence === "fuzzy") {
          console.log(`  🔍 Fuzzy match: "${mp.name}" ← "${matchResult.matchedName}"`);
          fuzzyMatches.push({ playerName: mp.name, matchedStatsName: matchResult.matchedName, stats });
        } else {
          console.log(`  ✅ Stats found for manual player: "${mp.name}"`);
        }
      } else {
        stats = { matches: 0, runs: 0, wickets: 0, avg: 0, sr: 0, innings: 0, economy: 0 };
        statsMatchedFrom = "";
        statsMatchConfidence = "none";
        console.log(`  ❌ No stats for manual player: "${mp.name}"`);
        noStats.push({ name: mp.name, phone: mp.phoneNumber || "", stats: { matches: 0, runs: 0, wickets: 0, avg: 0, sr: 0, innings: 0, economy: 0 } });
      }

      players.push({
        name: mp.name,
        role: mp.role || "AllRounder",
        photoUrl: mp.photoUrl || "",
        phoneNumber: mp.phoneNumber || "",
        jerseySize: mp.jerseySize || "",
        battingHand: mp.battingHand || "Right",
        bowlingHand: mp.bowlingHand || "Right",
        favTeam: mp.favTeam || "",
        basePrice: 4000,
        stats,
        statsMatchedFrom,
        statsMatchConfidence,
        unSold: false,
        isSold: false,
        soldTo: null,
        soldFor: 0,
        lastYearSoldPrice: 0,
        lastYearSoldTeam: "",
      });
    });
  }

  // Write no-stats list
  fs.writeFileSync(NO_STATS_OUT, JSON.stringify(noStats, null, 2));
  console.log(`\n📝 Players with NO stats (${noStats.length}): → ${NO_STATS_OUT}`);

  // Write fuzzy-match list for human verification
  fs.writeFileSync(FUZZY_MATCH_OUT, JSON.stringify(fuzzyMatches, null, 2));
  console.log(`📝 Fuzzy stat matches requiring verification (${fuzzyMatches.length}): → ${FUZZY_MATCH_OUT}`);

  return players;
}

// ─── Parse Teams JSON ─────────────────────────────────────────────────────────
function parseTeams() {
  console.log(`\n📄 Reading teams: ${TEAMS_JSON}`);
  if (!fs.existsSync(TEAMS_JSON)) throw new Error(`Teams JSON not found: ${TEAMS_JSON}`);
  const teams = JSON.parse(fs.readFileSync(TEAMS_JSON, "utf8"));
  teams.forEach((t, i) => {
    if (!t.name) throw new Error(`Team[${i}] missing name`);
    t.motto       = t.motto       || "";
    t.owner       = t.owner       || "";
    t.purseLeft   = t.purseLeft   || 100000;
    t.ownerValuation = t.ownerValuation || 0;
    t.squad = [];
  });
  console.log(`✅ ${teams.length} teams parsed`);
  return teams;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const isReset  = process.argv.includes("--reset");

  console.log("\n🏏 KCC Mini Tournament Season 1 — Database Seeding");
  console.log("=".repeat(55));
  if (isDryRun) console.log("🔍 DRY-RUN MODE — nothing will be written to MongoDB");

  const statsMap = loadStatsDB();
  const players  = parseExcel(statsMap);
  const teams    = parseTeams();

  console.log("\n📊 Summary:");
  console.log(`   Players : ${players.length}`);
  console.log(`   Teams   : ${teams.length}`);
  console.log(`   Collections: players_mini_s1, teams_mini_s1, bids_mini_s1`);

  // Role distribution
  const roleDist = {};
  players.forEach(p => { roleDist[p.role] = (roleDist[p.role] || 0) + 1; });
  console.log("\n   Roles:");
  Object.entries(roleDist).forEach(([r, c]) => console.log(`     ${r}: ${c}`));

  if (isDryRun) {
    console.log("\n✅ Dry-run complete — no DB writes.");
    process.exit(0);
  }

  // Connect
  console.log("\n🔌 Connecting to MongoDB...");
  await connectToDB();
  console.log("✅ Connected");

  if (isReset) {
    console.log("\n🗑️  Clearing existing mini_s1 collections...");
    await PlayerMiniS1.deleteMany({});
    await TeamMiniS1.deleteMany({});
    console.log("✅ Cleared");
  }

  // Insert
  console.log("\n📥 Inserting teams...");
  const insertedTeams = await TeamMiniS1.insertMany(teams);
  console.log(`✅ ${insertedTeams.length} teams inserted`);

  // Pre-sell owners to their teams
  players.forEach(p => {
    const matchedTeam = insertedTeams.find(t => t.owner.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(t.owner.toLowerCase()));
    if (matchedTeam && matchedTeam.ownerValuation > 0) {
      p.isSold = true;
      p.unSold = false;
      p.soldTo = matchedTeam._id;
      p.soldFor = matchedTeam.ownerValuation;
      console.log(`  🤝 Pre-sold owner: ${p.name} to ${matchedTeam.name} for ${p.soldFor}`);
    }
  });

  console.log("\n📥 Inserting players...");
  const insertedPlayers = await PlayerMiniS1.insertMany(players);
  console.log(`✅ ${insertedPlayers.length} players inserted`);

  console.log("\n" + "=".repeat(55));
  console.log("🎉 Seeding complete!");
  console.log("=".repeat(55));
  console.log("\n💡 Next steps:");
  console.log("   1. Review mini_s1_fuzzy_matches.json and verify each match");
  console.log("   2. Review mini_s1_no_stats.json for players needing manual stats");
  console.log("   3. Set NEXT_PUBLIC_TOURNAMENT_YEAR=mini_s1 in .env");
  console.log("   4. Fill in owner names / logos in scripts/teams_mini_s1.json and re-seed");
  console.log("");

  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Seeding failed:", err.message);
  process.exit(1);
});
