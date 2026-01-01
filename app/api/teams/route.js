import connectToDB from "@/lib/db";
import { getModel } from "@/lib/getModel";

export async function GET() {
  await connectToDB();
  const Team = getModel('Team');
  // Populate squad with player info
  const teams = await Team.find().populate("squad").lean();
  return new Response(JSON.stringify(teams), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
