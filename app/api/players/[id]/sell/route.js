// app/api/players/[id]/sell/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";
import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export async function POST(request, { params }) {
  await connectToDB();

  const Player = getModel('Player');
  const Team = getModel('Team');
  const Bid = getModel('Bid');

  // 2) Start a session/transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 3) Load player & ensure unsold
    const { id } = await params;
    const player = await Player.findById(id).session(session);
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
    if (!winningTeam || !winningTeam.squad) {
      throw { status: 500, message: "Highest bid team data is incomplete or could not be populated" };
    }

    const salePrice = highestBid.amount;

    // 5) Update player
    player.isSold = true;
    player.unSold = false;
    player.soldTo = winningTeam._id;
    player.soldFor = salePrice;
    await player.save({ session });

    // 6) Update winning team
    winningTeam.squad.push(player._id);
    winningTeam.purseLeft = winningTeam.purseLeft - salePrice;
    await winningTeam.save({ session });

    // 8) Commit everything
    await session.commitTransaction();
    session.endSession();

    // Firebase Update
    set(ref(db, "auction/status"), {
      type: "SOLD",
      data: {
        player: { 
            name: player.name, 
            role: player.role, 
            photoUrl: player.photoUrl,
            stats: player.stats || { matches: 0, runs: 0, sr: 0, wickets: 0 }
        },
        amount: salePrice,
        teamName: winningTeam.name 
      }
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
      },
      { status: 200 }
    );
  } catch (err) {
    // Abort on error ONLY if transaction hasn't been committed
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    // Only verify if we own the session end
    try { session.endSession(); } catch(e) { }

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
