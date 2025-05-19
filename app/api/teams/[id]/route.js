// app/api/teams/[id]/route.js

import connectToDB from "@/lib/db";
import Team from "@/lib/models/team";
import Player from "@/lib/models/player"; // Important for .populate()

export async function GET(req, { params }) {
  const id = params.id; // This should be fine as params is already resolved

  try {
    await connectToDB();

    const team = await Team.findById(id).populate("squad").lean();

    if (!team) {
      return new Response(JSON.stringify({ error: "Team not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(team), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
