import connectToDB from "@/lib/db";
import Player from "@/lib/models/player";

export async function GET() {
  await connectToDB();
  const players = await Player.find().lean();
  return new Response(JSON.stringify(players), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
