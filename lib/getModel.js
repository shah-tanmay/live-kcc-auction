import Player from "./models/player.js";
import Team from "./models/team.js";
import MockPlayer from "./models/mockPlayer.js";
import MockTeam from "./models/mockTeam.js";
import Bid from "./models/bid.js";
import MockBid from "./models/mockBid.js";

// Import 2026 models
import Player2026 from "./models/player2026.js";
import Team2026 from "./models/team2026.js";
import Bid2026 from "./models/bid2026.js";

// Import Mini Tournament Season 1 models
import PlayerMiniS1 from "./models/playerMiniS1.js";
import TeamMiniS1 from "./models/teamMiniS1.js";
import BidMiniS1 from "./models/bidMiniS1.js";

export const getModel = (modelName) => {
    const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    // TOURNAMENT_YEAR (no NEXT_PUBLIC) is the server-side runtime value.
    // NEXT_PUBLIC_ vars get inlined by webpack at build time and may be stale in cached builds.
    const tournamentYear = process.env.TOURNAMENT_YEAR || process.env.NEXT_PUBLIC_TOURNAMENT_YEAR || '2026';

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

    // Mini Tournament Season 1
    if (tournamentYear === 'mini_s1') {
        if (modelName === 'Player') {
            return PlayerMiniS1;
        }
        if (modelName === 'Team') {
            return TeamMiniS1;
        }
        if (modelName === 'Bid') {
            return BidMiniS1;
        }
    }

    // Real mode: Use year-based models
    if (tournamentYear === '2026') {
        if (modelName === 'Player') {
            return Player2026;
        }
        if (modelName === 'Team') {
            return Team2026;
        }
        // Bids for 2026
        if (modelName === 'Bid') {
            return Bid2026;
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
