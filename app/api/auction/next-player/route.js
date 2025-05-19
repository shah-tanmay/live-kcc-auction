import { setCurrentPlayer } from '@/lib/currentAuction';
import connectDB from '@/lib/db';
import Player from '@/lib/models/player';

export async function GET() {
    await connectDB();

    // Find all players who are not sold
    const unsoldPlayers = await Player.find({ unSold: true });

    const validPlayers = await Player.find({
        isSold: { $ne: true },
        unSold: { $ne: true },
    });

    let randomPlayer;

    console.log('validPlayers:', validPlayers.length);
    console.log('unsoldPlayers:', unsoldPlayers.length);

    if (validPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * validPlayers.length);
        randomPlayer = validPlayers[randomIndex];
    } else if(unsoldPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * unsoldPlayers.length);
        randomPlayer = unsoldPlayers[randomIndex];
    }

    if (validPlayers.length == 0 && unsoldPlayers.length === 0) {
        return new Response(JSON.stringify({ message: 'All players sold' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await setCurrentPlayer({
        player: randomPlayer,
        amount: -1,
    });

    global.__io.emit('newPlayer', {
        player: randomPlayer,
    });

    return new Response(JSON.stringify(randomPlayer), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
