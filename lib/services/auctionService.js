
import mongoose from 'mongoose';
import { getModel } from '@/lib/getModel';
import { db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

/**
 * Sells a player to a team for a specific amount.
 * Handles DB updates (Player, Team) and Firebase status.
 */
export async function sellPlayerToTeam(playerId, teamId, amount, session = null, teamDoc = null) {
    const Player = getModel('Player');
    const Team = getModel('Team');

    // 1. Fetch Player and Team
    const player = await Player.findById(playerId).session(session);
    const team = teamDoc || await Team.findById(teamId).session(session);

    if (!player) throw new Error("Player not found");
    if (!team) throw new Error("Team not found");
    
    console.log(`[AuctionService] Selling ${player.name} to ${team.name} for ${amount}`);

    // 2. Update Player
    player.isSold = true;
    player.unSold = false;
    player.soldTo = team._id;
    player.soldFor = Number(amount) || 0;
    await player.save({ session });

    // 3. Update Team
    const inSquad = team.squad.some(pid => pid.toString() === player._id.toString());
    if (!inSquad) {
        team.squad.push(player._id);
    }
    
    const currentPurse = Number(team.purseLeft) || 0;
    team.purseLeft = currentPurse - amount;
    
    // Only save if we aren't handling a multi-sale from outside (though saving twice is usually okay if we keep the same ref)
    await team.save({ session });

    // 4. Update Firebase Status (Outside transaction usually, or handled after commit)
    // Here we just set it. If it fails, the DB is still correct.
    try {
        await set(ref(db, "auction/status"), {
            type: "SOLD",
            data: {
                player: {
                    name: player.name,
                    role: player.role,
                    photoUrl: player.photoUrl,
                    stats: player.stats || { matches: 0, runs: 0, sr: 0, wickets: 0 }
                },
                amount: amount,
                teamName: team.name
            },
            timestamp: Date.now()
        });
    } catch (firebaseError) {
        console.error("Firebase update failed during sellPlayerToTeam:", firebaseError);
    }

    return { success: true, player, team };
}
