import connectDB from '@/lib/db';
import { getModel } from "@/lib/getModel";
import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export async function GET() {
    try {
        await connectDB();
        const Player = getModel('Player');

        const Team = getModel('Team');
        const teams = await Team.find({}).lean();
        const ownerNames = teams.flatMap(t => 
            t.owner ? t.owner.split(/,|&/).map(s => s.trim()).filter(s => s) : []
        );

        // Find all players who are not sold and NOT owners
        const validPlayers = await Player.find({
            isSold: { $ne: true },
            unSold: { $ne: true },
            name: { $nin: ownerNames }
        }).lean();

        // Also consider previously unsold players if valid list is empty?
        const unsoldPlayers = await Player.find({ unSold: true, name: { $nin: ownerNames } }).lean();

        let randomPlayer;

        if (validPlayers.length > 0) {
            const randomIndex = Math.floor(Math.random() * validPlayers.length);
            randomPlayer = validPlayers[randomIndex];
        } else if(unsoldPlayers.length > 0) {
            const randomIndex = Math.floor(Math.random() * unsoldPlayers.length);
            randomPlayer = unsoldPlayers[randomIndex];
        }

        if (!randomPlayer) {
            await set(ref(db, 'auction/isFinished'), true);
            return new Response(JSON.stringify({ message: 'All players sold' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update Firebase
        // Ensure stats has a default if missing
        const safeStats = randomPlayer.stats || { matches: 0, runs: 0, sr: 0, wickets: 0 };
        
        // Wait for all updates
        await Promise.all([
            set(ref(db, 'auction/currentPlayer'), {
                name: randomPlayer.name,
                role: randomPlayer.role,
                photoUrl: randomPlayer.photoUrl || '',
                stats: safeStats,
                _id: randomPlayer._id.toString(),
                basePrice: randomPlayer.basePrice || 4000,
                lastYearSoldPrice: randomPlayer.lastYearSoldPrice || 0,
                lastYearSoldTeam: randomPlayer.lastYearSoldTeam || ''
            }),
            set(ref(db, 'auction/currentBid'), { amount: 'No Bids Yet', teamName: 'No Team Yet' }),
            set(ref(db, 'auction/status'), null)
        ]);

        return new Response(JSON.stringify(randomPlayer), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Next Player API Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
