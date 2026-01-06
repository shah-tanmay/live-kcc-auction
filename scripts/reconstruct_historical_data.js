import "dotenv/config";
import mongoose from "mongoose";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";
import Bid from "../lib/models/bid.js";

async function reconstruct() {
  await connectToDB();
  
  console.log("🚀 Starting historical data reconstruction...");

  // 1. Fetch all bids
  const bids = await Bid.find({}).sort({ amount: -1 }).lean();
  console.log(`📊 Found ${bids.length} total bids in the collection.`);

  if (bids.length === 0) {
    console.log("❌ No bids found. Cannot reconstruct.");
    process.exit(0);
  }

  // 2. Group by player and find highest bid
  const highestBids = {}; // playerId -> bidObject
  
  bids.forEach(bid => {
    const playerId = bid.player.toString();
    if (!highestBids[playerId] || bid.amount > highestBids[playerId].amount) {
      highestBids[playerId] = bid;
    }
  });

  const playerIds = Object.keys(highestBids);
  console.log(`✅ Identified ${playerIds.length} players with bids.`);

  // 3. Update Player documents
  let updatedCount = 0;
  for (const playerId of playerIds) {
    const bid = highestBids[playerId];
    const updateResult = await Player.updateOne(
      { _id: bid.player },
      {
        $set: {
          isSold: true,
          soldFor: bid.amount,
          soldTo: bid.team,
          unSold: false
        }
      }
    );
    
    if (updateResult.modifiedCount > 0 || updateResult.matchedCount > 0) {
       updatedCount++;
    }
  }

  console.log(`✨ Successfully reconstructed data for ${updatedCount} players.`);
  
  // 4. Double check Ashish Brahme
  const ashish = await Player.findOne({ name: /Ashish Brahme/i }).lean();
  if (ashish && ashish.isSold) {
    const team = await Team.findById(ashish.soldTo).lean();
    console.log("\n🔍 Verification for Ashish Brahme:");
    console.log(`   - Name: ${ashish.name}`);
    console.log(`   - isSold: ${ashish.isSold}`);
    console.log(`   - soldFor: ${ashish.soldFor}`);
    console.log(`   - soldTo: ${team?.name || "N/A"}`);
  }

  process.exit(0);
}

reconstruct().catch(err => {
  console.error("❌ Reconstruction failed:", err);
  process.exit(1);
});
