// app/api/players/[id]/sell/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/lib/db";
import Player from "@/lib/models/player";
import Team from "@/lib/models/team";
import Bid from "@/lib/models/bid";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request, { params }) {
  await connectToDB();

  // 2) Start a session/transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 3) Load player & ensure unsold
    const player = await Player.findById(params.id).session(session);
    if (!player) {
      throw { status: 404, message: "Player not found" };
    }
    if (player.isSold) {
      throw { status: 400, message: "Player already sold" };
    }

    // 4) Find the highest bid
    const highestBid = await Bid.findOne({ player: player._id })
      .sort({ amount: -1 })
      .populate("team")
      .session(session);

    if (!highestBid) {
      throw { status: 400, message: "No bids found for this player" };
    }

    const winningTeam = highestBid.team;
    const salePrice = highestBid.amount;

    // 5) Update player
    player.isSold = true;
    player.isSoldTo = winningTeam._id;
    player.isSoldFor = salePrice;
    player.isSold = true;
    await player.save({ session });

    // 6) Update winning team
    winningTeam.squad.push(player._id);
    winningTeam.purseLeft = winningTeam.purseLeft - salePrice;
    await winningTeam.save({ session });

    // 7) <-- No bid deletion, keep full bid history

    // 8) Commit everything
    await session.commitTransaction();
    session.endSession();

    global.__io.emit("playerSold", {
      player: player._id,
      team: winningTeam._id,
      teamName: winningTeam.name,
      amount: highestBid,
    });

    // 9) Return the sale result
    return NextResponse.json(
      {
        message: "Player sold successfully",
        player: {
          id: player._id,
          name: player.name,
          soldTo: {
            id: winningTeam._id,
            name: winningTeam.name,
          },
          soldFor: salePrice,
        },
        updatedTeam: {
          id: winningTeam._id,
          name: winningTeam.name,
          budgetLeft: winningTeam.budget,
          squadSize: winningTeam.squad.length,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    // Abort on error
    await session.abortTransaction();
    session.endSession();

    if (err.status && err.message) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Sell‐route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// curl -X POST http://localhost:3000/api/players/682993026e7d2dc4d286fdb3/sell \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $TOKEN"
