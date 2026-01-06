import "dotenv/config";
import connectToDB from "./lib/db.js";
import Player2026 from "./lib/models/player2026.js";
import MockPlayer from "./lib/models/mockPlayer.js";

async function globalSearch() {
  await connectToDB();
  
  const searchName = /Nishant/i;

  console.log("--- Collection: players_2026 ---");
  const p2026 = await Player2026.find({ name: searchName }).lean();
  p2026.forEach(p => {
    console.log(`ID: ${p._id}, Name: "${p.name}"`);
    console.log(`   Stats: ${JSON.stringify(p.stats)}`);
    console.log(`   History: Price: ${p.lastYearSoldPrice}, Team: ${p.lastYearSoldTeam}`);
  });

  console.log("\n--- Collection: mock_players ---");
  const pmock = await MockPlayer.find({ name: searchName }).lean();
  pmock.forEach(p => {
    console.log(`ID: ${p._id}, Name: "${p.name}"`);
    console.log(`   Stats: ${JSON.stringify(p.stats)}`);
    console.log(`   History: Price: ${p.lastYearSoldPrice}, Team: ${p.lastYearSoldTeam}`);
  });

  process.exit(0);
}

globalSearch();
