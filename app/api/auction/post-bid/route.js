// app/api/bid/route.js

import connectDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ref, set, push } from "firebase/database";

export async function POST(req) {
  await connectDB();

  const Player = getModel('Player');
  const Team = getModel('Team');
  // Dynamic Bid Model logic inline for now or I should allow getModel('Bid')
  // For safety, let's use the standard Bid model but maybe clear it on seed? 
  // User asked for "test tables". 
  // I will add MockBid to `getModel`.
  const BidModel = getModel('Bid');

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

  // ✅ Enforce budget cutoff logic & squad limit
  const playersOwned = team.squad.length;
  
  if (playersOwned >= 9) {
    return NextResponse.json(
      { error: `Team ${team.name} already has maximum of 9 players. Cannot place more bids.` },
      { status: 400 }
    );
  }

  const totalSlots = 9;
  const remainingSlots = totalSlots - playersOwned - 1; // -1 for current player
  const minReserve = remainingSlots > 0 ? remainingSlots * 4000 : 0;
  const maxBidAllowed = team.purseLeft - minReserve;

  if (bidAmount > maxBidAllowed) {
    return NextResponse.json(
      {
        error: `Bid exceeds max allowed limit. You have ₹${team.purseLeft} total, must reserve ₹${minReserve} for ${remainingSlots} slots. Max allowed: ₹${maxBidAllowed}`,
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

  const highestBid = await BidModel.findOne({ player: player._id })
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

  const bid = new BidModel({
    player: player._id,
    team: team._id,
    amount: bidAmount,
    timestamp: new Date(),
  });

  await bid.save();

  // Update Firebase
  set(ref(db, "auction/currentBid"), {
    player: player._id.toString(),
    team: team._id.toString(),
    teamName: team.name, // Ensure we send the name!
    amount: bidAmount,
    timestamp: bid.timestamp.toISOString(),
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
