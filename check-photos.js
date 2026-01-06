import "dotenv/config";
import connectToDB from "./lib/db.js";
import MockPlayer from "./lib/models/mockPlayer.js";
import fs from "fs";

async function checkPhotos() {
  await connectToDB();
  
  const players = await MockPlayer.find({}).lean();
  const missing = [];
  const googleDrive = [];
  const local = [];
  
  players.forEach(p => {
    if (!p.photoUrl) {
      missing.push(p.name);
    } else if (p.photoUrl.includes('googleusercontent') || p.photoUrl.includes('drive.google')) {
      googleDrive.push({ name: p.name, url: p.photoUrl });
    } else {
      const localPath = `./public${p.photoUrl}`;
      if (!fs.existsSync(localPath)) {
        missing.push(`${p.name} (local file not found: ${p.photoUrl})`);
      } else {
        local.push(p.name);
      }
    }
  });
  
  console.log(`\n📊 Photo Status Report:`);
  console.log(`✅ Local photos found: ${local.length}`);
  console.log(`☁️  Google Drive links: ${googleDrive.length}`);
  console.log(`❌ Missing/broken: ${missing.length}\n`);
  
  if (missing.length > 0) {
    console.log('Missing/Broken Photos:');
    missing.forEach(m => console.log(`  - ${m}`));
  }
  
  if (googleDrive.length > 0) {
    console.log('\nGoogle Drive URLs (may not render):');
    googleDrive.slice(0, 5).forEach(g => console.log(`  - ${g.name}: ${g.url}`));
    if (googleDrive.length > 5) console.log(`  ... and ${googleDrive.length - 5} more`);
  }
  
  process.exit(0);
}

checkPhotos();
