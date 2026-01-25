// app/api/players/unsold/route.js

import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export async function GET(request) {
  // 1) Ensure DB is connected
  await connectToDB();
  const Player = getModel('Player');

  const Team = getModel('Team');
  const teams = await Team.find({}).lean();
  const ownerNames = teams.flatMap(t => 
      t.owner ? t.owner.split(/,|&/).map(s => s.trim()).filter(s => s) : []
  );

  // 2) Find all players who haven't been sold yet and are NOT owners
  const unsoldPlayers = await Player.find({ unSold: true, name: { $nin: ownerNames } })
    .select("name role photoUrl basePrice stats") // pick any fields you need
    .lean();

  // 3) Return them
  return NextResponse.json(
    {
      count: unsoldPlayers.length,
      players: unsoldPlayers.map((p) => {
        return {
          name: p.name,
          role: p.role,
          price: 4000,
        }
      }),
    },
    { status: 200 }
  );
}
