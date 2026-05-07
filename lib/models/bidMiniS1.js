import mongoose from "mongoose";

const bidMiniS1Schema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlayerMiniS1",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMiniS1",
    required: true,
  },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { collection: 'bids_mini_s1' });

export default mongoose.models.BidMiniS1 || mongoose.model("BidMiniS1", bidMiniS1Schema);
