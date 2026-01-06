import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";
import mongoose from "mongoose";

async function investigate() {
  console.log("🔌 Connecting to MongoDB...");
  await connectToDB();

  const targetPlayerId = "677914bf6829705a69894101"; // User provided ID was 24 chars hex? Wait, the user provided ID "695b473fd8ed8b0680f7fe3f" is 24 chars.
  // Wait, let's use the ID provided in the prompt: 695b473fd8ed8b0680f7fe3f
  // But wait, standard Mongo ID is 24 hex chars. 
  // 695b473fd8ed8b0680f7fe3f is 24 chars long.
  
  const targetId = "695b473fd8ed8b0680f7fe3f";
  const targetTeam = "682b3c44e793f077d24e85b9";

  console.log(`\n🔍 Investigating Player ID: ${targetId}`);
  console.log(`🔍 Target Team ID: ${targetTeam}`);

  try {
    // 1. Find all players sold to this team
    const playersSoldToTeam = await Player.find({ soldTo: targetTeam });
    
    console.log(`✅ Found ${playersSoldToTeam.length} players sold to this team.`);

    let totalSpentExcludingTarget = 0;
    let targetPlayerFound = false;

    playersSoldToTeam.forEach(p => {
      if (p._id.toString() === targetId) {
        targetPlayerFound = true;
        console.log(`   -> Found target player in team's list (Current SoldFor: ${p.soldFor})`);
      } else {
        totalSpentExcludingTarget += (p.soldFor || 0);
      }
    });

    const startPurse = 100000;
    const derivedPrice = startPurse - totalSpentExcludingTarget;

    console.log("\n📊 Calculation:");
    console.log(`   Total Purse: ${startPurse}`);
    console.log(`   Spent on Others: ${totalSpentExcludingTarget}`);
    console.log(`   Derived Price for Target: ${derivedPrice}`);

    // Update the base price for ALL players in this collection
    console.log("\n🛠️  Updating base prices...");
    const updateResult = await Player.updateMany({}, { $set: { basePrice: 2000 } });
    console.log(`✅ Updated basePrice to 2000 for ${updateResult.modifiedCount} players.`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    process.exit();
  }
}

investigate();
