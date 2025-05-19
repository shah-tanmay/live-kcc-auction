import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  purseLeft: {
    type: Number,
    default: 100000, // initial budget per team
  },
  squad: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

export default mongoose.models.Team || mongoose.model("Team", teamSchema);
