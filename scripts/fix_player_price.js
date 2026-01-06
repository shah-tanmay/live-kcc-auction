import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";

async function fixPlayerPrice() {
  console.log("🔌 Connecting to MongoDB...");
  await connectToDB();

  const targetPlayerId = "695b473fd8ed8b0680f7fe3f";
  const newPrice = 16000;

  console.log(`\n🛠️  Updating Player ID: ${targetPlayerId}`);
  console.log(`   Setting soldFor to: ${newPrice}`);

  try {
    const result = await Player.updateOne(
      { _id: targetPlayerId },
      { $set: { soldFor: newPrice } }
    );

    if (result.matchedCount === 0) {
      console.log("❌ Player not found!");
    } else if (result.modifiedCount === 0) {
      console.log("⚠️  Player found but price was already 16000.");
    } else {
      console.log("✅ Successfully updated player price.");
    }

    // Verify
    const updatedPlayer = await Player.findById(targetPlayerId);
    if(updatedPlayer) {
        console.log(`   Current Price in DB: ${updatedPlayer.soldFor}`);
    }

  } catch (err) {
    console.error("❌ Error updating player:", err);
  } finally {
    process.exit();
  }
}

fixPlayerPrice();
