import mongoose from "mongoose";

const mockPlayerSchema = new mongoose.Schema({
  name: String,
  role: String,
  photoUrl: String,
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    avg: { type: Number, default: 0 },
    sr: { type: Number, default: 0 },
  },
  basePrice: { type: Number, default: 4000 },
  battingHand: { type: String, enum: ['Right', 'Left'], default: 'Right' },
  bowlingHand: { type: String, enum: ['Right-arm Fast', 'Right-arm Spin', 'Left-arm Fast', 'Left-arm Spin', 'Right', 'Left'], default: 'Right' },
  favTeam: { type: String, default: '' },
  lastYearSoldPrice: { type: Number, default: 0 },
  lastYearSoldTeam: { type: String, default: '' },

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
