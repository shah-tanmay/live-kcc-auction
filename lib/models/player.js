import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  role: String,
  photoUrl: String,
  stats: Object,
  basePrice: Number,

  // 🔥 Auction-related fields
  unSold: {
    type: Boolean,
    default: false,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  soldFor: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.Player || mongoose.model("Player", playerSchema);
