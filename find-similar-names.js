import "dotenv/config";
import connectToDB from "./lib/db.js";
import Player from "./lib/models/player.js";
import fs from "fs";

// Normalize name for comparison
function normalize(name) {
  return name.toLowerCase().trim();
}

// Extract first name
function getFirstName(name) {
  return name.split(' ')[0].toLowerCase().trim();
}

// Calculate Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

async function findSimilarPlayers() {
  await connectToDB();

  // Fetch all historical players (2025)
  const historicalPlayers = await Player.find({}).lean();
  
  // Read current season players from Excel (we'll use the seeded mock_players for now)
  const MockPlayer = (await import("./lib/models/mockPlayer.js")).default;
  const currentPlayers = await MockPlayer.find({}).lean();

  console.log(`Historical players: ${historicalPlayers.length}`);
  console.log(`Current players: ${currentPlayers.length}`);

  const matches = [];
  const exactMatches = [];
  const firstNameMatches = [];
  const fuzzyMatches = [];

  currentPlayers.forEach(current => {
    const currentNorm = normalize(current.name);
    const currentFirst = getFirstName(current.name);

    historicalPlayers.forEach(historical => {
      const historicalNorm = normalize(historical.name);
      const historicalFirst = getFirstName(historical.name);

      // Exact match
      if (currentNorm === historicalNorm) {
        exactMatches.push({
          current: current.name,
          historical: historical.name,
          matchType: "EXACT",
          historicalPrice: historical.soldFor,
          historicalTeam: historical.soldTo?.name || "N/A"
        });
        return;
      }

      // First name match
      if (currentFirst === historicalFirst && currentFirst.length > 3) {
        firstNameMatches.push({
          current: current.name,
          historical: historical.name,
          matchType: "FIRST_NAME",
          historicalPrice: historical.soldFor,
          historicalTeam: historical.soldTo?.name || "N/A"
        });
      }

      // Fuzzy match (Levenshtein distance <= 3)
      const distance = levenshtein(currentNorm, historicalNorm);
      if (distance <= 3 && distance > 0) {
        fuzzyMatches.push({
          current: current.name,
          historical: historical.name,
          matchType: "FUZZY",
          distance: distance,
          historicalPrice: historical.soldFor,
          historicalTeam: historical.soldTo?.name || "N/A"
        });
      }
    });
  });

  const output = {
    summary: {
      exactMatches: exactMatches.length,
      firstNameMatches: firstNameMatches.length,
      fuzzyMatches: fuzzyMatches.length,
      totalCurrentPlayers: currentPlayers.length,
      totalHistoricalPlayers: historicalPlayers.length
    },
    exactMatches,
    firstNameMatches,
    fuzzyMatches
  };

  // Write to JSON file
  fs.writeFileSync('player_name_matches.json', JSON.stringify(output, null, 2));
  
  console.log('\n✅ Results saved to player_name_matches.json');
  console.log(`\nSummary:`);
  console.log(`  Exact matches: ${exactMatches.length}`);
  console.log(`  First name matches: ${firstNameMatches.length}`);
  console.log(`  Fuzzy matches: ${fuzzyMatches.length}`);
  console.log('\nReview the JSON file and remove any incorrect matches.');
  
  process.exit(0);
}

findSimilarPlayers();
