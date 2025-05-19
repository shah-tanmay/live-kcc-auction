// app/api/bid/route.js

import connectDB from "@/lib/db";
import Player from "@/lib/models/player";
import Team from "@/lib/models/team";
import Bid from "@/lib/models/bid";
import { getAdminFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { setCurrentBid } from "@/lib/currentAuction";

export async function POST(req) {
  await connectDB();

  // const admin = await getAdminFromRequest(req);
  // if (!admin) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  const { playerId, teamId, bidAmount } = await req.json();

  if (!playerId || !teamId || typeof bidAmount !== "number") {
    return NextResponse.json(
      { error: "playerId, teamId, and numeric bidAmount are required" },
      { status: 400 }
    );
  }

  if (bidAmount <= 0) {
    return NextResponse.json(
      { error: "Bid amount must be greater than zero" },
      { status: 400 }
    );
  }

  const player = await Player.findById(playerId);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  if (player.isSold) {
    return NextResponse.json({ error: "Player already sold" }, { status: 400 });
  }

  const team = await Team.findById(teamId).populate("squad");
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // ✅ Enforce budget cutoff logic
  const playersOwned = team.squad.length;
  const remainingSlots = 8 - playersOwned - 1; // -1 for current player
  const minReserve = remainingSlots * 2000;
  const maxBidAllowed = team.purseLeft - minReserve;

  if (bidAmount > maxBidAllowed) {
    return NextResponse.json(
      {
        error: `Bid exceeds max allowed limit. You have ₹${team.budget} total, must reserve ₹${minReserve} for ${remainingSlots} slots. Max allowed: ₹${maxBidAllowed}`,
      },
      { status: 400 }
    );
  }

  if (bidAmount < player.basePrice) {
    return NextResponse.json(
      {
        error: `Bid must be greater than or equal to base price of ₹${player.basePrice}`,
      },
      { status: 400 }
    );
  }

  const highestBid = await Bid.findOne({ player: player._id })
    .sort({ amount: -1 })
    .exec();

  if (highestBid) {
    if (bidAmount <= highestBid.amount) {
      return NextResponse.json(
        {
          error: `Bid must be higher than current highest bid of ₹${highestBid.amount}`,
        },
        { status: 400 }
      );
    }

    if (highestBid.team.toString() === team._id.toString()) {
      return NextResponse.json(
        { error: "Same team cannot place consecutive bids on this player" },
        { status: 400 }
      );
    }
  }

  const bid = new Bid({
    player: player._id,
    team: team._id,
    amount: bidAmount,
    timestamp: new Date(),
  });

  await bid.save();

  await setCurrentBid({
    player: player._id.toString(),
    team: team._id.toString(),
    teamName: team.name,
    amount: bidAmount,
    timestamp: bid.timestamp,
  });

  global.__io.emit("newBid", {
    player: player._id,
    team: team._id,
    teamName: team.name,
    amount: bidAmount,
    timestamp: bid.timestamp,
  });

  return NextResponse.json(
    {
      message: "Bid placed successfully",
      bid: {
        id: bid._id,
        player: player._id,
        team: team._id,
        amount: bid.amount,
        timestamp: bid.timestamp,
      },
    },
    { status: 200 }
  );
}
