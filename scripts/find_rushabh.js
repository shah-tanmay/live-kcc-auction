import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";

async function run() {
  await connectToDB();
  const all = await Player.find({});
  const matches = all.filter(p => p.name.toLowerCase().includes("rushabh"));
  console.log("Matches:", matches);
  process.exit();
}
run();
