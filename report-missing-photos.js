import "dotenv/config";
import connectToDB from "./lib/db.js";
import MockPlayer from "./lib/models/mockPlayer.js";
import fs from "fs";

async function reportMissingPhotos() {
  await connectToDB();
  
  const players = await MockPlayer.find({}).sort({ name: 1 }).lean();
  const missing = [];
  
  console.log('\n🔍 Checking photo files in /public/players/...\n');
  
  players.forEach(p => {
    if (p.photoUrl && p.photoUrl.startsWith('/players/')) {
      const localPath = `./public${p.photoUrl}`;
      if (!fs.existsSync(localPath)) {
        missing.push({
          name: p.name,
          expectedPath: p.photoUrl,
          fullPath: localPath
        });
      }
    }
  });
  
  if (missing.length === 0) {
    console.log('✅ All player photos found!');
  } else {
    console.log(`❌ Missing ${missing.length} player photos:\n`);
    missing.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name}`);
      console.log(`   Expected: ${m.expectedPath}\n`);
    });
    
    console.log('\n📝 Action Required:');
    console.log('Add the missing photo files to /public/players/ directory.');
    console.log('Files should match the expected filenames shown above.');
  }
  
  process.exit(0);
}

reportMissingPhotos();
