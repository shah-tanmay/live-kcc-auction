import connectDB from "@/lib/db";
import Player from "@/lib/models/player";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const admin = await getAdminFromRequest(req);
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { playerId } = await req.json();

  if (!playerId) {
    return new Response(JSON.stringify({ error: "Missing playerId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const player = await Player.findById(playerId);
  if (!player) {
    return new Response(JSON.stringify({ error: "Player not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (player.isSold) {
    return new Response(JSON.stringify({ error: "Player already sold" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  player.isSold = true;
  await player.save();

  return new Response(
    JSON.stringify({ message: "Player marked as sold", player }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
