import mongoose from "mongoose";

const mockPlayerSchema = new mongoose.Schema({
  name: String,
  role: String,
  photoUrl: String,
  stats: Object,
  basePrice: { type: Number, default: 4000 },

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
    ref: "MockTeam", // Reference MockTeam
    default: null,
  },
  soldFor: {
    type: Number,
    default: 0,
  },
}, { collection: 'mock_players' });

export default mongoose.models.MockPlayer || mongoose.model("MockPlayer", mockPlayerSchema);
