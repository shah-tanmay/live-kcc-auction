// app/api/players/[id]/sell/route.js

import { getAdminFromRequest } from '@/lib/auth';
import connectToDB from '@/lib/db';
import Player from '@/lib/models/player';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
    await connectToDB();

    // // 1) Auth check
    // const admin = await getAdminFromRequest(request);
    // if (!admin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        // 3) Load player & ensure unsold
        const { id } = await params;
        const player = await Player.findById(params.id);
        if (!player) {
            throw { status: 404, message: 'Player not found' };
        }
        if (player.isSold) {
            throw { status: 400, message: 'Player already sold' };
        }

        // 5) Update player
        player.unSold = true;
        await player.save();

        global.__io.emit('playerUnSold', {
            player: player._id,
        });

        // 9) Return the sale result
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
        // Abort on error

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
