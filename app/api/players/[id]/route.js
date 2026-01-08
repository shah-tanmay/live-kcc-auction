import connectDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export async function GET(request, context) {
  await connectDB();
  const Player = getModel('Player');

  const { id } = context.params;

  try {
    const player = await Player.findById(id).lean();
    if (!player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(player), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
