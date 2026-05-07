/**
 * resetFirebaseMiniS1.js
 * Resets Firebase Realtime Database auction state for Mini Tournament Season 1.
 * Run this ONCE before starting the auction.
 *
 * Usage: node scripts/resetFirebaseMiniS1.js
 */

import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

async function resetAuction() {
  console.log("\n🔥 Resetting Firebase auction state for Mini Tournament Season 1...\n");

  // Clear entire auction node and rebuild clean
  await set(ref(db, "auction"), {
    isFinished:    false,
    currentPlayer: null,
    currentBid:    null,
    status:        null,
  });

  console.log("✅ auction/isFinished     → false");
  console.log("✅ auction/currentPlayer  → null");
  console.log("✅ auction/currentBid     → null");
  console.log("✅ auction/status         → null");
  console.log("\n🎉 Firebase reset complete — auction is ready to start!\n");

  process.exit(0);
}

resetAuction().catch(err => {
  console.error("❌ Reset failed:", err.message);
  process.exit(1);
});
