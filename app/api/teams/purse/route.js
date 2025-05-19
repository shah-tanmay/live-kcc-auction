// app/api/teams/purse/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/lib/models/team";

export async function GET() {
  // 1) ensure DB is connected
  await connectDB();

  // 2) load every team, projecting only the fields we need
  let teams = await Team.find()
    .select("name purseLeft squad ") // or "purseLeft" if you prefer that field
    .lean();

  teams = teams.map((team) => {
    const totalSlots = 8;
    const owned = team.squad.length;
    // One slot is for the player currently up for bidding
    const remainingSlots = totalSlots - owned - 1;
    const minReserve = remainingSlots > 0 ? remainingSlots * 2000 : 0;
    const maxBidAllowed = team.purseLeft - minReserve;
    return {
      ...team,
      maxBidAllowed,
    };
  });

  // 3) return an array of { id, name, remainingPurse }
  return NextResponse.json(
    teams.map((t) => ({
      id: t._id,
      name: t.name,
      remainingPurse: t.purseLeft, // or t.purseLeft
      maxBidAllowed: t.maxBidAllowed,
    })),
    { status: 200 }
  );
}
