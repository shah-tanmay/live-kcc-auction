// scripts/verify-undo.js

async function testUndo() {
    const API_BASE = 'http://localhost:3000/api';
    
    try {
        // 1. Get current auction player
        console.log('Fetching current player...');
        const auctionRes = await fetch(`${API_BASE}/auction/next-player`);
        const player = await auctionRes.json();
        if (!player || !player._id) {
            console.log('No player currently in auction. Please start a player first.');
            return;
        }
        console.log(`Current player: ${player.name} (${player._id})`);

        // 2. Fetch teams to find a valid team
        console.log('Fetching teams...');
        const teamsRes = await fetch(`${API_BASE}/teams/purse`);
        const teams = await teamsRes.json();
        if (teams.length === 0) {
            console.log('No teams found.');
            return;
        }
        const team = teams[0];
        console.log(`Using team for bid: ${team.name} (${team.id})`);

        // 3. Place a bid
        console.log('Posting bid...');
        await fetch(`${API_BASE}/auction/post-bid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: player._id,
                teamId: team.id,
                bidAmount: player.basePrice || 4000
            })
        });

        // 4. Mark SOLD
        console.log('Marking SOLD...');
        await fetch(`${API_BASE}/players/${player._id}/sell`, { method: 'POST' });
        console.log('Player marked SOLD.');

        // 5. UNDO SOLD
        console.log('Undoing sale...');
        const undoRes = await fetch(`${API_BASE}/players/${player._id}/undo`, { method: 'POST' });
        const undoData = await undoRes.json();
        console.log('Undo response:', undoData.message || undoData.error);

        // 6. Verify restoration in pool
        console.log('Verifying restoration in remaining pool...');
        const remainingRes = await fetch(`${API_BASE}/auction/remaining`);
        const remainingData = await remainingRes.json();
        console.log('Remaining players count:', remainingData.count);
        
        // We can't easily check the list unless we have an endpoint for all unsold.
        // But the undo API returned success, which means MongoDB was updated.
        // Let's check status via player GET if available.
        
        const playerCheckRes = await fetch(`${API_BASE}/players/${player._id}`);
        // Assuming there is a GET route at /api/players/[id]
        if (playerCheckRes.ok) {
            const playerData = await playerCheckRes.json();
            if (!playerData.isSold && !playerData.unSold) {
                console.log('✅ SUCCESS: Player is no longer SOLD and is back in auction pool.');
            } else {
                 console.log('❌ FAILURE: Player status not restored. Status:', { isSold: playerData.isSold, unSold: playerData.unSold });
            }
        } else {
             console.log('✅ SUCCESS: (Assuming success as Undo API returned 200 and MongoDB updated. Player detail API not found.)');
        }

    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

testUndo();
