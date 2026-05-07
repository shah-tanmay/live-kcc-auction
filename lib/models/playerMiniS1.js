import mongoose from "mongoose";

const playerMiniS1Schema = new mongoose.Schema({
  name: String,
  role: String,
  photoUrl: String,
  phoneNumber: { type: String, default: '' },
  jerseySize: { type: String, default: '' },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    avg: { type: Number, default: 0 },
    sr: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
  },
  basePrice: { type: Number, default: 4000 },
  battingHand: { type: String, enum: ['Right', 'Left'], default: 'Right' },
  bowlingHand: { type: String, enum: ['Right-arm Fast', 'Right-arm Spin', 'Left-arm Fast', 'Left-arm Spin', 'Right', 'Left'], default: 'Right' },
  favTeam: { type: String, default: '' },
  lastYearSoldPrice: { type: Number, default: 0 },
  lastYearSoldTeam: { type: String, default: '' },

  // Stats match confidence (for fuzzy matching)
  statsMatchedFrom: { type: String, default: '' }, // The name from seed data that was matched
  statsMatchConfidence: { type: String, enum: ['exact', 'fuzzy', 'none'], default: 'none' },

  // 🔥 Auction-related fields
  unSold: { type: Boolean, default: false },
  isSold: { type: Boolean, default: false },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMiniS1",
    default: null,
  },
  soldFor: { type: Number, default: 0 },
}, { collection: 'players_mini_s1' });

export default mongoose.models.PlayerMiniS1 || mongoose.model("PlayerMiniS1", playerMiniS1Schema);
