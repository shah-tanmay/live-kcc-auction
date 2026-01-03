import mongoose from "mongoose";

const mockTeam2026Schema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  motto: { type: String, default: '' },
  owner: { type: String, default: '' },
  purseLeft: {
    type: Number,
    default: 200000, // Mock Mode Default: 2 Lakhs
  },
  squad: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockPlayer2026",
    },
  ],
}, { collection: 'mock_teams_2026' });

export default mongoose.models.MockTeam2026 || mongoose.model("MockTeam2026", mockTeam2026Schema);
