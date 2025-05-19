import { setCurrentPlayer } from "@/lib/currentAuction";
import connectDB from "@/lib/db";
import Player from "@/lib/models/player";

export async function GET() {
  await connectDB();

  // Find all players who are not sold
  const unsoldPlayers = await Player.find({ sold: { $ne: true } });

  const validPlayers = await Player.find({
    sold: { $ne: true },
    unSold: { $ne: true },
  });

  let randomPlayer;

  if (validPlayers.length > 0) {
    const randomIndex = Math.floor(Math.random() * validPlayers.length);
    randomPlayer = validPlayers[randomIndex];
  }

  if (unsoldPlayers.length === 0) {
    return new Response(JSON.stringify({ message: "All players sold" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pick a random player
  const randomIndex = Math.floor(Math.random() * unsoldPlayers.length);
  randomPlayer = unsoldPlayers[randomIndex];

  console.log(randomPlayer)

  await setCurrentPlayer({
    player: randomPlayer,
    amount: -1,
  });

  global.__io.emit("newPlayer", {
    player: randomPlayer,
  });

  return new Response(JSON.stringify(randomPlayer), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
