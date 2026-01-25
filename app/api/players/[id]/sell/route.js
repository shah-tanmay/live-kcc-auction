import { sellPlayerToTeam } from "@/lib/services/auctionService";

export async function POST(request, { params }) {
  await connectToDB();

  const Player = getModel('Player');
  const Bid = getModel('Bid');

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = await params;
    const player = await Player.findById(id).session(session);
    if (!player) {
      throw { status: 404, message: "Player not found" };
    }
    if (player.isSold) {
      throw { status: 400, message: "Player already sold" };
    }

    // Find the highest bid
    const highestBid = await Bid.findOne({ player: player._id })
      .sort({ amount: -1 })
      .populate("team")
      .session(session);

    if (!highestBid) {
      throw { status: 400, message: "No bids found for this player" };
    }

    const winningTeam = highestBid.team;
    if (!winningTeam) {
      throw { status: 500, message: "Highest bid team data is incomplete" };
    }

    const salePrice = highestBid.amount;

    // Use the shared service for the actual sale logic
    await sellPlayerToTeam(player._id, winningTeam._id, salePrice, session);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
        message: "Player sold successfully",
        player: {
          id: player._id,
          name: player.name,
          soldTo: { id: winningTeam._id, name: winningTeam.name },
          soldFor: salePrice,
        },
    }, { status: 200 });

  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    try { session.endSession(); } catch(e) { }

    if (err.status && err.message) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Sell‐route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// curl -X POST http://localhost:3000/api/players/682993026e7d2dc4d286fdb3/sell \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer $TOKEN"
