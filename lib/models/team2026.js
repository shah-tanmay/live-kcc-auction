import mongoose from "mongoose";

const team2026Schema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  motto: { type: String, default: '' },
  owner: { type: String, default: '' },
  purseLeft: {
    type: Number,
    default: 100000, // initial budget per team
  },
  squad: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player2026",
    },
  ],
  isRevealed: {
    type: Boolean,
    default: false,
  },
  ownerValuation: {
    type: Number,
    default: 0,
  },
  ownerValuations: {
    type: Map,
    of: Number,
    default: {},
  },
}, { collection: 'teams_2026' });

export default mongoose.models.Team2026 || mongoose.model("Team2026", team2026Schema);
