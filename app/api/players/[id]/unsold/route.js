// app/api/players/[id]/unsold/route.js

import connectToDB from '@/lib/db';
import { getModel } from '@/lib/getModel';
import { NextResponse } from 'next/server';
import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export async function POST(request, { params }) {
    await connectToDB();
    const Player = getModel('Player');

    try {
        const { id } = await params;
        const player = await Player.findById(id);
        if (!player) {
            throw { status: 404, message: 'Player not found' };
        }
        if (player.isSold) {
            throw { status: 400, message: 'Player already sold' };
        }

        // Update player
        player.unSold = true;
        await player.save();

        // Firebase Update
        set(ref(db, "auction/status"), {
            type: "UNSOLD",
            data: {
                player: { name: player.name },
                name: player.name
            }
        });

        return NextResponse.json(
            {
                message: 'Player Unsold',
                player: {
                    id: player._id,
                    name: player.name,
                },
            },
            { status: 200 }
        );
    } catch (err) {
        if (err.status && err.message) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }

        console.error('Sell‐route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// curl -X POST http://localhost:3000/api/players/682993026e7d2dc4d286fdb3/sell \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $TOKEN"
