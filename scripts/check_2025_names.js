import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";

async function checkPlayers() {
  await connectToDB();

  const namesToCheck = [
    "Rushabh Bora",
    "Chirag Bharat Shah",
    "Parth Raval",
    "Parth Raval " // check for trailing space
  ];

  console.log("🔍 Checking 2025 Player Collection for:");
  console.log(namesToCheck);

  const allPlayers = await Player.find({});
  
  console.log(`\n📂 Total players in 2025 DB: ${allPlayers.length}`);

  namesToCheck.forEach(name => {
    // Case insensitive regex search
    const regex = new RegExp(name, 'i');
    const matches = allPlayers.filter(p => p.name.match(regex));
    
    if (matches.length > 0) {
      console.log(`\n✅ Found matches for "${name}":`);
      matches.forEach(m => {
        console.log(`   - ID: ${m._id}`);
        console.log(`     Name: "${m.name}"`); // Quotes to see whitespace
        console.log(`     SoldFor: ${m.soldFor}`);
        console.log(`     IsSold: ${m.isSold}`);
      });
    } else {
      console.log(`\n❌ No matches found for "${name}"`);
    }
  });
  
  // Also dump all names that are somewhat similar to "Rushabh" or "Chirag" or "Parth"
  console.log("\n🔍 Fuzzy check:");
  const fuzzy = allPlayers.filter(p => 
    p.name.toLowerCase().includes("rushabh") || 
    p.name.toLowerCase().includes("chirag") || 
    p.name.toLowerCase().includes("parth")
  );
  
  fuzzy.forEach(p => console.log(`   - "${p.name}" (Sold: ${p.soldFor})`));

  process.exit();
}

checkPlayers();
