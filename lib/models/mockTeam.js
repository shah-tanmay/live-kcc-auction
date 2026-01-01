import mongoose from "mongoose";

const mockTeamSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  purseLeft: {
    type: Number,
    default: 200000, // Mock Mode Default: 2 Lakhs
  },
  squad: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockPlayer", // Reference MockPlayer
    },
  ],
}, { collection: 'mock_teams' });

export default mongoose.models.MockTeam || mongoose.model("MockTeam", mockTeamSchema);
