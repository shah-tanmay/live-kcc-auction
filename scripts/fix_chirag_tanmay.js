import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";

async function fixData() {
  await connectToDB();

  // 1. Fix Chirag
  const chiragTeamId = "682b3c44e793f077d24e85b9";
  console.log(`\n🛠️  Fixing Chirag Bharat Shah...`);
  await Player.updateOne(
    { name: "Chirag Bharat Shah" },
    { $set: { soldTo: chiragTeamId } }
  );
  console.log("   ✅ Updated soldTo.");

  // 2. Fix/Add Tanmay
  const tanmayTeamId = "682b3c44e793f077d24e85be";
  console.log(`\n🛠️  Fixing/Adding Tanmay Shah...`);
  
  // Check if exists first to avoid dupes or full overwrite if stats exist
  const tanmay = await Player.findOne({ name: "Tanmay Shah" });
  if (tanmay) {
      await Player.updateOne(
          { _id: tanmay._id },
          { 
              $set: { 
                  soldFor: 25000, 
                  soldTo: tanmayTeamId,
                  isSold: true,
                  unSold: false
              } 
          }
      );
      console.log("   ✅ Updated existing Tanmay Shah.");
  } else {
      await Player.create({
          name: "Tanmay Shah",
          soldFor: 25000,
          soldTo: tanmayTeamId,
          isSold: true,
          unSold: false,
          basePrice: 2000,
          role: "AllRounder", // Default
          battingHand: "Right",
          bowlingHand: "Right-arm Spin"
      });
      console.log("   ✅ Created new Tanmay Shah.");
  }

  // 3. Verify Teams Exist (Crucial for the 'Unknown Team' issue)
  console.log(`\n🔍 Verifying Teams...`);
  
  const chiragTeam = await Team.findById(chiragTeamId);
  if (chiragTeam) {
      console.log(`   ✅ Team for Chirag found: "${chiragTeam.name}"`);
  } else {
      console.warn(`   ⚠️  Team for Chirag (${chiragTeamId}) NOT found in Team collection!`);
      // Optional: Create it? User didn't ask, but "Unknown Team" will persist if I don't.
      // I'll leave it as warning for now, user might have just given me the ID assuming it's there.
  }

  const tanmayTeam = await Team.findById(tanmayTeamId);
  if (tanmayTeam) {
      console.log(`   ✅ Team for Tanmay found: "${tanmayTeam.name}"`);
  } else {
      console.warn(`   ⚠️  Team for Tanmay (${tanmayTeamId}) NOT found in Team collection!`);
  }

  process.exit();
}

fixData();
