import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1) ensure DB is connected
  await connectDB();
  const Team = getModel('Team');

  // 2) load every team, projecting only the fields we need
  let teams = await Team.find()
    .select("name purseLeft squad owner logoUrl") 
    .lean();

  teams = teams.map((team) => {
    const totalSlots = 10;
    const owned = team.squad.length;
    // One slot is for the player currently up for bidding
    const remainingSlots = totalSlots - owned - 1;
    const minReserve = remainingSlots > 0 ? remainingSlots * 4000 : 0;
    const maxBidAllowed = team.purseLeft - minReserve;
    return {
      ...team,
      maxBidAllowed,
      squadCount: owned
    };
  });

  // 3) return an array of { id, name, remainingPurse }
  return NextResponse.json(
    teams.map((t) => ({
      id: t._id,
      name: t.name,
      remainingPurse: t.purseLeft,
      maxBidAllowed: t.maxBidAllowed,
      owner: t.owner,
      logoUrl: t.logoUrl,
      squadCount: t.squadCount
    })),
    { status: 200 }
  );
}
