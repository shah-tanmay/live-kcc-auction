import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { getModel } from "@/lib/getModel";
import { sellPlayerToTeam } from "@/lib/services/auctionService";

export async function POST(req) {
  try {
    await connectToDB();
    const { teamId, password } = await req.json();

    const Team = getModel('Team');
    const Player = getModel('Player');

    if (!teamId || !password) {
      return NextResponse.json({ message: 'Missing teamId or password' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    console.log(`[Reveal] Team: ${team.name}, current purseLeft: ${team.purseLeft}`);

    // Construct env key from team name
    const envName = team.name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, '_');
    const envKey = `REVEAL_PASSWORD_${envName}`;
    const correctPassword = process.env[envKey];

    if (!correctPassword) {
       console.error(`Password not set for team ${team.name} (Key: ${envKey})`);
       return NextResponse.json({ message: 'Configuration error: Password not found on server' }, { status: 500 });
    }

    if (password !== correctPassword) {
      return NextResponse.json({ message: 'Invalid secret key' }, { status: 401 });
    }

    if (!team.isRevealed) {
      const ownerNames = team.owner.split(/,|&/).map(s => s.trim()).filter(s => s);
      let totalToDeduct = 0;
      
      console.log(`[Reveal] Finalizing owners for ${team.name}`);

      for (const ownerName of ownerNames) {
         const player = await Player.findOne({ 
             name: { $regex: new RegExp(`^${ownerName}$`, 'i') } 
         });

         if (player) {
            let individualPrice = null;
            if (team.ownerValuations) {
                if (typeof team.ownerValuations.get === 'function') {
                    individualPrice = team.ownerValuations.get(ownerName) ?? team.ownerValuations.get(player.name);
                } else {
                    individualPrice = team.ownerValuations[ownerName] ?? team.ownerValuations[player.name];
                }
            }
            
            const priceToSet = (individualPrice !== null && individualPrice !== undefined) 
                ? individualPrice 
                : (team.ownerValuation || 0);
            
            totalToDeduct += Number(priceToSet) || 0;

            // Direct call to the shared "Sell" service, passing the team doc reference
            await sellPlayerToTeam(player._id, team._id, priceToSet, null, team);
         }
      }
      
      // The service calls team.save() multiple times, but since we pass the same object reference 'team',
      // it should stay in sync. We set isRevealed at the end.
      team.isRevealed = true;
      await team.save();
    }

    return NextResponse.json({ success: true, team });

  } catch (error) {
    console.error('Error revealing price:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
