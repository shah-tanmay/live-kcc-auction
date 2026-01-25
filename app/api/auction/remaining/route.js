import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const Player = getModel('Player');
  
  const Team = getModel('Team');
  const teams = await Team.find({}).lean();
  const ownerNames = teams.flatMap(t => 
      t.owner ? t.owner.split(/,|&/).map(s => s.trim()).filter(s => s) : []
  );

  // Players who are not sold and NOT owners
  const count = await Player.countDocuments({ 
    isSold: false,
    name: { $nin: ownerNames }
  });
  
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
