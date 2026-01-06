import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import mongoose from "mongoose";

async function addPlayer() {
  console.log("🔌 Connecting to MongoDB...");
  await connectToDB();

  const newPlayer = {
    name: "Parth Raval",
    soldFor: 41000,
    soldTo: "682b3c44e793f077d24e85bb",
    isSold: true,
    unSold: false,
    basePrice: 2000, // Consistent with recent update
    role: "AllRounder", // Defaulting as not specified
    battingHand: "Right", // Default
    bowlingHand: "Right-arm Fast", // Default
  };

  console.log(`\n➕ Adding new player: ${newPlayer.name}`);
  console.log(`   Sold For: ${newPlayer.soldFor}`);
  console.log(`   Sold To Team ID: ${newPlayer.soldTo}`);

  try {
    const createdPlayer = await Player.create(newPlayer);
    console.log("✅ Successfully created new player entry.");
    console.log(`   New Player ID: ${createdPlayer._id}`);
  } catch (err) {
    console.error("❌ Error adding player:", err);
  } finally {
    process.exit();
  }
}

addPlayer();
