import Player from "./models/player.js";
import Team from "./models/team.js";
import MockPlayer from "./models/mockPlayer.js";
import MockTeam from "./models/mockTeam.js";
import Bid from "./models/bid.js";
import MockBid from "./models/mockBid.js";

// Import 2026 models
import Player2026 from "./models/player2026.js";
import Team2026 from "./models/team2026.js";

export const getModel = (modelName) => {
    const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    const tournamentYear = process.env.NEXT_PUBLIC_TOURNAMENT_YEAR || '2026';

    // Mock mode: Always use standard mock collections (no year suffix)
    if (isMock) {
        if (modelName === 'Player') {
            return MockPlayer;
        }
        if (modelName === 'Team') {
            return MockTeam;
        }
        if (modelName === 'Bid') {
            return MockBid;
        }
        throw new Error(`Unknown model: ${modelName}`);
    }
    
    // Real mode: Use year-based models
    if (tournamentYear === '2026') {
        if (modelName === 'Player') {
            return Player2026;
        }
        if (modelName === 'Team') {
            return Team2026;
        }
        // Bids can use the standard Bid model for now
        if (modelName === 'Bid') {
            return Bid;
        }
    } else {
        // Fallback to old models for previous years
        if (modelName === 'Player') {
            return Player;
        }
        if (modelName === 'Team') {
            return Team;
        }
        if (modelName === 'Bid') {
            return Bid;
        }
    }
    
    throw new Error(`Unknown model: ${modelName}`);
};

