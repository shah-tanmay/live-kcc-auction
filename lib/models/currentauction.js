// models/CurrentAuction.js
import mongoose from "mongoose";

const currentAuctionSchema = new mongoose.Schema(
  {
    player: {
      id: { type: String },
      name: { type: String },
      role: { type: String },
      basePrice: { type: Number },
    },
    bid: {
      player: { type: String },
      team: { type: String },
      teamName: { type: String },
      amount: { type: Number },
      timestamp: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.CurrentAuction ||
  mongoose.model("CurrentAuction", currentAuctionSchema);
