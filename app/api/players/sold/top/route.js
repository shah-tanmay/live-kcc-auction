// app/api/players/sold/top/route.js

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { getModel } from "@/lib/getModel";

export async function GET() {
    // 1) ensure DB is connected
    await connectToDB();
    const Player = getModel('Player');

    const Team = getModel('Team');
    const teams = await Team.find({}).lean();
    const ownerNames = teams.flatMap(t => 
        t.owner ? t.owner.split(/,|&/).map(s => s.trim()).filter(s => s) : []
    );

    // 2) find top 10 sold players by highest sale price (EXCLUDING OWNERS)
    const topPlayers = await Player.find({ 
            isSold: true,
            name: { $nin: ownerNames } 
        })
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
                player: {
                    name: p.name,
                    role: p.role,
                    photoUrl: p.photoUrl
                },
                teamName: p.soldTo?.name || 'N/A',
                amount: p.soldFor,
            })),
        },
        { status: 200 }
    );
}
