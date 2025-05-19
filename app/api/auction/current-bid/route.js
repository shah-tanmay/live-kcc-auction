import { NextResponse } from "next/server";
import Player from "@/lib/models/player";
import Team from "@/lib/models/team";
import connectToDB from "@/lib/db";
import currentauction from "@/lib/models/currentauction";

export async function GET() {
  await connectToDB();

  try {
    const current = await currentauction.findOne();

    if (!current || !current.bid) {
      return NextResponse.json(
        { message: "No active bid found." },
        { status: 404 }
      );
    }

    const player = await Player.findById(current.bid.player);
    const team = await Team.findById(current.bid.team);

    return NextResponse.json({
      player: {
        name: player.name,
        id: player._id,
        role: player.role,
        basePrice: player.basePrice,
      },
      team: {
        name: team.name,
        id: team._id,
      },
      currentBid: current.bid.amount,
    });
  } catch (err) {
    console.error("Error fetching current bid:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
