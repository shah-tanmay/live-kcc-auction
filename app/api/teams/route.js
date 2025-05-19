import connectToDB from "@/lib/db";
import Team from "@/lib/models/team";
import Player from "@/lib/models/player.js"; // IMPORTANT: Import Player model

export async function GET() {
  await connectToDB();
  // Populate squad with player info
  const teams = await Team.find().populate("squad").lean();
  return new Response(JSON.stringify(teams), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
