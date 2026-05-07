import mongoose from "mongoose";

const teamMiniS1Schema = new mongoose.Schema({
  name: String,
  logoUrl: { type: String, default: '' },
  motto: { type: String, default: '' },
  owner: { type: String, default: '' },
  purseLeft: {
    type: Number,
    default: 100000,
  },
  squad: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerMiniS1",
    },
  ],
  isRevealed: { type: Boolean, default: false },
  ownerValuation: { type: Number, default: 0 },
  ownerValuations: {
    type: Map,
    of: Number,
    default: {},
  },
}, { collection: 'teams_mini_s1' });

export default mongoose.models.TeamMiniS1 || mongoose.model("TeamMiniS1", teamMiniS1Schema);
