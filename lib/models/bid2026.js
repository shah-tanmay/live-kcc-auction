import mongoose from "mongoose";

const bid2026Schema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player2026",
    required: true,
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team2026", 
    required: true 
  },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { collection: 'bids_2026' });

export default mongoose.models.Bid2026 || mongoose.model("Bid2026", bid2026Schema);
