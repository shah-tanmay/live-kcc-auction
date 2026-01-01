import mongoose from "mongoose";

const mockBidSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MockPlayer",
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MockTeam",
  },
  amount: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'mock_bids' });

export default mongoose.models.MockBid || mongoose.model("MockBid", mockBidSchema);
