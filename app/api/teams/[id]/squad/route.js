import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/lib/models/team";

export async function GET(request, { params }) {
  await connectDB();

  const { id } = params;
  const team = await Team.findById(id)
    .populate({
      path: "squad",
      select: "name role photoUrl basePrice sold soldTo soldFor",
      populate: { path: "soldTo", select: "name logoUrl" },
    })
    .lean();

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      squad: team.squad,
    },
    { status: 200 }
  );
}
