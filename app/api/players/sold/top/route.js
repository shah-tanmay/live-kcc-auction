// app/api/players/sold/top/route.js

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Player from '@/lib/models/player';

export async function GET() {
    // 1) ensure DB is connected
    await connectToDB();

    // 2) find top 10 sold players by highest sale price
    const topPlayers = await Player.find({ isSold: true })
        .sort({ soldFor: -1 })
        .limit(10)
        .select('name role photoUrl soldFor')
        .populate({
            path: 'soldTo',
            select: 'name logoUrl',
        })
        .lean();

    console.log('topPlayers', topPlayers);

    // 3) return
    return NextResponse.json(
        {
            count: topPlayers.length,
            players: topPlayers.map((p) => ({
                player: p.name,
                team: p.soldTo.name,
                amount: p.soldFor,
            })),
        },
        { status: 200 }
    );
}
