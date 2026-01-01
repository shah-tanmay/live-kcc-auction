import Player from "./models/player";
import Team from "./models/team";
import MockPlayer from "./models/mockPlayer";
import MockTeam from "./models/mockTeam";
import Bid from "./models/bid";
import MockBid from "./models/mockBid";

export const getModel = (modelName) => {
    const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    
    if (modelName === 'Player') {
        return isMock ? MockPlayer : Player;
    }
    if (modelName === 'Team') {
        return isMock ? MockTeam : Team;
    }
    if (modelName === 'Bid') {
        return isMock ? MockBid : Bid;
    }
    throw new Error(`Unknown model: ${modelName}`);
};
