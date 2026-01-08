import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const playerSchema = new mongoose.Schema({
  name: String,
  stats: {
    matches: Number,
    runs: Number,
    wickets: Number,
    avg: Number,
    sr: Number,
    innings: Number,
    economy: Number
  }
}, { collection: 'players_2026' });

const Player = mongoose.models.Player2026 || mongoose.model('Player2026', playerSchema);

async function checkStats() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const player = await Player.findOne({ name: 'Tanmay Shah' });
    if (!player) {
      console.log('❌ Player "Tanmay Shah" not found.');
      return;
    }

    console.log('Player Stats in DB:', JSON.stringify(player.stats, null, 2));
    
    if (player.stats.innings !== undefined && player.stats.economy !== undefined) {
      console.log('✅ Stats fields "innings" and "economy" EXIST.');
    } else {
      console.log('❌ Stats fields "innings" or "economy" are MISSING.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkStats();
