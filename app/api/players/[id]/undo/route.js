// app/api/players/[id]/undo/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";
import { db } from "@/lib/firebase";
import { ref, set, remove } from "firebase/database";

export async function POST(request, { params }) {
  await connectToDB();

    const Player = getModel('Player');
    const Team = getModel('Team');
    const Bid = getModel('Bid');

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { id } = await params;
        const player = await Player.findById(id).session(session);
        
        if (!player) {
            throw { status: 404, message: "Player not found" };
        }

        if (!player.isSold) {
            if (!player.unSold) {
                throw { status: 400, message: "Player is not sold or marked unsold" };
            }
        }

        let previousTeam = null;
        let salePrice = player.soldFor || 0;

        if (player.isSold && player.soldTo) {
            previousTeam = await Team.findById(player.soldTo).session(session);
            if (previousTeam) {
                previousTeam.squad = previousTeam.squad.filter(pId => pId.toString() !== player._id.toString());
                previousTeam.purseLeft = (previousTeam.purseLeft || 0) + salePrice;
                await previousTeam.save({ session });
            }
        }

        // Reset player status
        player.isSold = false;
        player.unSold = false;
        player.soldTo = null;
        player.soldFor = 0;
        await player.save({ session });

        // CRITICAL: Delete all bids associated with this player to prevent stale bids on resale
        await Bid.deleteMany({ player: player._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Firebase Update: Bring player back to active auction block
    const safeStats = player.stats || { matches: 0, runs: 0, sr: 0, wickets: 0 };
    
    await Promise.all([
        set(ref(db, 'auction/currentPlayer'), {
            name: player.name,
            role: player.role,
            photoUrl: player.photoUrl || '',
            stats: safeStats,
            _id: player._id.toString(),
            basePrice: player.basePrice || 4000,
            lastYearSoldPrice: player.lastYearSoldPrice || 0,
            lastYearSoldTeam: player.lastYearSoldTeam || ''
        }),
        set(ref(db, 'auction/currentBid'), { amount: 'No Bids Yet', teamName: 'No Team Yet' }),
        set(ref(db, 'auction/status'), null)
    ]);

    return NextResponse.json(
      {
        message: "Player sale undone successfully",
        player: {
          id: player._id,
          name: player.name,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    try { session.endSession(); } catch(e) { }

    if (err.status && err.message) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Undo‐route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
