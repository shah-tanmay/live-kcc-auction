
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { getModel } from '@/lib/getModel';

export async function POST(req) {
  try {
    await connectToDB();
    const { teamId, updates } = await req.json();

    if (!teamId || !updates) {
      return NextResponse.json({ message: 'Missing teamId or updates' }, { status: 400 });
    }

    const Team = getModel('Team');
    const Player = getModel('Player');

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    // `updates` should be an object mapping ownerName -> price
    // e.g. { "Viren Palesa": 15000, "Rushubh bora": 12000 }
    
    // Update the map
    if (!team.ownerValuations) {
        team.ownerValuations = {};
    }

    let totalValuation = 0;
    
    // Process each update
    for (const [ownerName, price] of Object.entries(updates)) {
        const numericPrice = Number(price);
        
        // 1. Update Team Map
        if (team.ownerValuations instanceof Map) {
            team.ownerValuations.set(ownerName, numericPrice);
        } else {
            // Mongoose sometimes hydrates Maps as objects depending on schema config or options
            // But our schema defines it as Type: Map
            // Using .set() is safer if strictly typed, but let's handle object fallback just in case
             if (typeof team.ownerValuations.set === 'function') {
                 team.ownerValuations.set(ownerName, numericPrice);
             } else {
                 team.ownerValuations[ownerName] = numericPrice;
             }
        }

        totalValuation += numericPrice;

        // 2. Update Player soldFor if they exist
        const player = await Player.findOne({ 
             name: { $regex: new RegExp(`^${ownerName}$`, 'i') } 
        });
        
        if (player) {
            // If already sold to this team, update the price
            if (player.isSold && player.soldTo?.toString() === team._id.toString()) {
                // If price changed, we need to adjust purse?
                // Actually, this API is strictly for "setting" the price before or during.
                // If already revealed, we might need to adjust purse difference.
                // Let's keep it simple: If revealed, we assume this is a correction.
                
                const oldPrice = player.soldFor || 0;
                const diff = numericPrice - oldPrice;
                
                player.soldFor = numericPrice;
                await player.save();
                
                // Adjust team purse if already deducted (i.e. revealed)
                if (team.isRevealed) {
                    team.purseLeft = (team.purseLeft || 0) - diff;
                }
            }
        }
    }

    // 3. Update total ownerValuation on team
    team.ownerValuation = totalValuation;
    
    await team.save();

    return NextResponse.json({ success: true, team });

  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
