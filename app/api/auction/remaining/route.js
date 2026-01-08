import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const Player = getModel('Player');
  
  // Players who are not sold
  const count = await Player.countDocuments({ 
    isSold: false
  });
  
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
