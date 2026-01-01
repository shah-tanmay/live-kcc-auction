import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Player from '@/lib/models/player';
import Team from '@/lib/models/team';
import MockPlayer from '@/lib/models/mockPlayer';
import MockTeam from '@/lib/models/mockTeam';
import { db } from '@/lib/firebase';
import { ref, remove } from 'firebase/database';

export async function POST() {
    try {
        await connectToDB();

        // 1. Clear existing Mock Data (MongoDB)
        await MockPlayer.deleteMany({});
        await MockTeam.deleteMany({});

        // 2. Fetch Real Data
        const realPlayers = await Player.find({}).lean();
        const realTeams = await Team.find({}).lean();

        // 3. Transform and Seed Players
        // Reset: unsold=false, isSold=false, soldTo=null, soldFor=0, basePrice=4000
        const mockPlayersData = realPlayers.map(p => ({
            _id: p._id, // Keep same ID for consistency
            name: p.name,
            role: p.role,
            photoUrl: p.photoUrl,
            stats: p.stats,
            basePrice: 4000,
            unSold: false,
            isSold: false,
            soldTo: null,
            soldFor: 0
        }));

        await MockPlayer.insertMany(mockPlayersData);

        // 4. Transform and Seed Teams
        // Reset: purseLeft=200000, squad=[]
        const mockTeamsData = realTeams.map(t => ({
            _id: t._id, // Keep same ID
            name: t.name,
            logoUrl: t.logoUrl,
            purseLeft: 200000,
            squad: []
        }));

        await MockTeam.insertMany(mockTeamsData);

        // 5. Clear Firebase Realtime State - FORCE REMOVE
        try {
            await remove(ref(db, 'auction'));
        } catch (fbError) {
            console.error("Firebase Remove Error:", fbError);
            // Don't fail the whole seed if FB fails, but log it
        }

        return NextResponse.json({ 
            message: "Mock DB Seeded & Firebase Reset Successfully", 
            players: mockPlayersData.length, 
            teams: mockTeamsData.length 
        });

    } catch (error) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
