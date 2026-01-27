import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const Player = getModel('Player');
  const players = await Player.find()
    .populate("soldTo", "name logoUrl")
    .sort({ name: 1 })
    .lean();
  
  return new Response(JSON.stringify(players), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
