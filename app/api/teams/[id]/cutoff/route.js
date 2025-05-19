import connectDB from "@/lib/db";
import Team from "@/lib/models/team";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();

  const { id } = params;
  const team = await Team.findById(id);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const totalSlots = 8;
  const owned = team.squad.length;
  // One slot is for the player currently up for bidding
  const remainingSlots = totalSlots - owned - 1;
  const minReserve = remainingSlots > 0 ? remainingSlots * 2000 : 0;
  const maxBidAllowed = team.budget - minReserve;

  return NextResponse.json({
    id,
    currentBudget: team.budget,
    playersOwned: owned,
    remainingSlots,
    minReserve,
    maxBidAllowed: maxBidAllowed < 0 ? 0 : maxBidAllowed,
  });
}
