import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { getModel } from "@/lib/getModel";

export async function POST(req) {
  try {
    await connectToDB();
    const { teamId } = await req.json();

    const Team = getModel('Team');
    const Player = getModel('Player');

    if (!teamId) {
      return NextResponse.json({ message: 'Missing teamId' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    if (team.isRevealed) {
      team.isRevealed = false;
      
      const ownerNames = team.owner.split(/,|&/).map(s => s.trim()).filter(s => s);
      const ownerPlayerIds = [];
      let totalRefund = 0;

      for (const ownerName of ownerNames) {
         const player = await Player.findOne({ 
             name: { $regex: new RegExp(`^${ownerName}$`, 'i') } 
         });

         if (player) {
            totalRefund += player.soldFor || 0;
            player.isSold = false;
            player.soldTo = null;
            player.soldFor = 0;
            await player.save();
            ownerPlayerIds.push(player._id.toString());
         }
      }

      team.squad = team.squad.filter(pid => !ownerPlayerIds.includes(pid.toString()));
      team.purseLeft = (Number(team.purseLeft) || 0) + totalRefund;
      await team.save();
    }

    return NextResponse.json({ success: true, message: `Reset reveal for team ${team.name}` });

  } catch (error) {
    console.error('Error resetting reveal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
