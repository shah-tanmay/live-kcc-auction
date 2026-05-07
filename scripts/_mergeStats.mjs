import fs from 'fs';

const seedData = JSON.parse(fs.readFileSync('scripts/players_seed_data.json', 'utf8'));
const noStatsData = JSON.parse(fs.readFileSync('scripts/mini_s1_no_stats.json', 'utf8'));

let added = 0;
noStatsData.forEach(player => {
    // Only add if they have actual stats filled (matches > 0)
    if (player.stats && player.stats.matches > 0) {
        // Check if player already exists
        const existing = seedData.find(p => p.name.toLowerCase() === player.name.toLowerCase());
        if (existing) {
            existing.stats = player.stats;
        } else {
            seedData.push({
                name: player.name,
                stats: player.stats
            });
        }
        added++;
    }
});

fs.writeFileSync('scripts/players_seed_data.json', JSON.stringify(seedData, null, 4));
console.log(`Added/Updated ${added} players in players_seed_data.json`);
