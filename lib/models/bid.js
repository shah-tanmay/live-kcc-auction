import mongoose from "mongoose";
// import Player from "@/lib/models/player";
// import Team from "@/lib/models/team";

const BidSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Bid || mongoose.model("Bid", BidSchema);