import "dotenv/config";
import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";

const teams = [
    "Champions -- Dream Big",
    "Upadhyay Warriors",
    "Solanki Strikers",
    "AJ Turf Titans -- Play Bold",
    "Oswal Avengers -- Conquer the game",
    "Kumar Waghresha Smashers"
];

const battingHands = ['Right', 'Left'];
const bowlingHands = ['Right-arm Fast', 'Right-arm Spin', 'Left-arm Fast', 'Left-arm Spin'];

async function populate() {
    await connectToDB();
    
    const players = await Player.find();
    console.log(`Found ${players.length} players to update.`);
    
    for (const player of players) {
        // Random Stats
        const matches = Math.floor(Math.random() * 50) + 10;
        const runs = Math.floor(Math.random() * 1500) + 100;
        const wickets = Math.floor(Math.random() * 60);
        const avg = parseFloat((runs / (matches * 0.8)).toFixed(2));
        const sr = parseFloat((120 + Math.random() * 40).toFixed(2));
        
        player.stats = {
            matches,
            runs,
            wickets,
            avg,
            sr
        };
        
        player.battingHand = battingHands[Math.floor(Math.random() * battingHands.length)];
        player.bowlingHand = bowlingHands[Math.floor(Math.random() * bowlingHands.length)];
        player.favTeam = teams[Math.floor(Math.random() * teams.length)];
        
        await player.save();
    }
    
    console.log("Player stats and fields populated successfully!");
    process.exit();
}

populate().catch(err => {
    console.error(err);
    process.exit(1);
});
