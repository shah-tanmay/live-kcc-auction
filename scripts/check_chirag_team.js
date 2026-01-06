import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";

async function checkChiragTeam() {
  await connectToDB();

  const chirag = await Player.findOne({ name: "Chirag Bharat Shah" });
  if (chirag) {
      console.log("Found Chirag in DB:");
      console.log(`  _id: ${chirag._id}`);
      console.log(`  soldTo: ${chirag.soldTo}`);
      
      if (chirag.soldTo) {
          const team = await Team.findById(chirag.soldTo);
          console.log(`  Team Lookup Result: ${team ? team.name : "NULL (Team not found!)"}`);
      } else {
          console.log("  soldTo field is missing/null.");
      }
  } else {
      console.log("Chirag Bharat Shah not found in DB.");
  }
  process.exit();
}

checkChiragTeam();
