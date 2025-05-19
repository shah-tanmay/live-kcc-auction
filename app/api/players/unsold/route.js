// app/api/players/unsold/route.js

import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Player from "@/lib/models/player";

export async function GET(request) {
  // 1) Ensure DB is connected
  await connectToDB();

  // 2) Find all players who haven't been sold yet
  const unsoldPlayers = await Player.find({ unSold: true })
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
          price: 2000,
        }
      }),
    },
    { status: 200 }
  );
}
