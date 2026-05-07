import connectDB from "@/lib/db";
import { getModel } from "@/lib/getModel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const Team = getModel('Team');

  const { id } = params;
  const team = await Team.findById(id);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const totalSlots = 10;
  const owned = team.squad.length;
  // One slot is for the player currently up for bidding
  const remainingSlots = totalSlots - owned - 1;
  const minReserve = remainingSlots > 0 ? remainingSlots * 4000 : 0;
  console.log(owned, remainingSlots, minReserve);
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
