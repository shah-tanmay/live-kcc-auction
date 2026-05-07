import mongoose from 'mongoose';
import connectToDB from '../lib/db.js';
import { getModel } from '../lib/getModel.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function rankTeams() {
    await connectToDB();
    const Team = getModel('Team');
    const teams = await Team.find().populate("squad").lean();
    
    // Calculate team rankings based on player stats
    const teamAnalysis = teams.map(team => {
        const squad = team.squad || [];
        
        // Calculate total stats
        let totalStars = 0;
        let totalBattingAvg = 0;
        let totalBowlingAvg = 0;
        let totalStrikeRate = 0;
        let totalRuns = 0;
        let totalWickets = 0;
        let battingCount = 0;
        let bowlingCount = 0;
        let allRounders = 0;
        
        squad.forEach(player => {
            // Star rating
            totalStars += player.starRating || 0;
            
            // Batting stats
            if (player.stats?.runs > 0) {
                totalRuns += player.stats.runs;
                totalBattingAvg += player.stats.battingAverage || 0;
                totalStrikeRate += player.stats.strikeRate || 0;
                battingCount++;
            }
            
            // Bowling stats
            if (player.stats?.wickets > 0) {
                totalWickets += player.stats.wickets;
                totalBowlingAvg += player.stats.bowlingAverage || 0;
                bowlingCount++;
            }
            
            // All-rounders
            if (player.stats?.runs > 0 && player.stats?.wickets > 0) {
                allRounders++;
            }
        });
        
        const avgStars = squad.length > 0 ? totalStars / squad.length : 0;
        const avgBattingAvg = battingCount > 0 ? totalBattingAvg / battingCount : 0;
        const avgBowlingAvg = bowlingCount > 0 ? totalBowlingAvg / bowlingCount : 0;
        const avgStrikeRate = battingCount > 0 ? totalStrikeRate / battingCount : 0;
        
        // Weighted scoring system
        // Stars (40%), Batting (25%), Bowling (25%), Balance (10%)
        const starScore = avgStars * 8; // 40 points max
        const battingScore = (avgBattingAvg / 50) * 12.5 + (avgStrikeRate / 150) * 12.5; // 25 points max
        const bowlingScore = (25 / Math.max(avgBowlingAvg, 1)) * 25; // 25 points max (lower avg is better)
        const balanceScore = (allRounders / squad.length) * 10; // 10 points max
        
        const totalScore = starScore + battingScore + bowlingScore + balanceScore;
        
        return {
            name: team.name,
            squadSize: squad.length,
            purseLeft: team.purseLeft,
            avgStars: avgStars.toFixed(2),
            totalRuns,
            totalWickets,
            avgBattingAvg: avgBattingAvg.toFixed(2),
            avgBowlingAvg: avgBowlingAvg.toFixed(2),
            avgStrikeRate: avgStrikeRate.toFixed(2),
            allRounders,
            totalScore: totalScore.toFixed(2),
            squad: squad.map(p => ({
                name: p.name,
                stars: p.starRating || 0,
                soldFor: p.soldFor || 0,
                runs: p.stats?.runs || 0,
                wickets: p.stats?.wickets || 0,
                battingAvg: p.stats?.battingAverage || 0,
                bowlingAvg: p.stats?.bowlingAverage || 0,
                strikeRate: p.stats?.strikeRate || 0
            }))
        };
    });
    
    // Sort by total score
    teamAnalysis.sort((a, b) => b.totalScore - a.totalScore);
    
    // Display rankings
    console.log('\n🏆 KCC 2026 TEAM RANKINGS 🏆\n');
    console.log('═'.repeat(80));
    
    teamAnalysis.forEach((team, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        console.log(`\n${medal} ${team.name.toUpperCase()}`);
        console.log('─'.repeat(80));
        console.log(`Overall Score: ${team.totalScore} | Squad Size: ${team.squadSize} | Purse Left: ₹${team.purseLeft}`);
        console.log(`Avg Stars: ${team.avgStars}⭐ | All-Rounders: ${team.allRounders}`);
        console.log(`Total Runs: ${team.totalRuns} | Total Wickets: ${team.totalWickets}`);
        console.log(`Batting Avg: ${team.avgBattingAvg} | Bowling Avg: ${team.avgBowlingAvg} | Strike Rate: ${team.avgStrikeRate}`);
        console.log(`\nTop Players:`);
        team.squad.sort((a, b) => b.stars - a.stars).slice(0, 5).forEach(p => {
            console.log(`  • ${p.name} (${p.stars}⭐) - ₹${p.soldFor} | ${p.runs} runs, ${p.wickets} wkts`);
        });
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 Ranking Methodology:');
    console.log('  • Star Rating (40%): Average star rating of squad');
    console.log('  • Batting Strength (25%): Batting average + Strike rate');
    console.log('  • Bowling Strength (25%): Bowling average (lower is better)');
    console.log('  • Team Balance (10%): Number of all-rounders');
    console.log('\n');
    
    await mongoose.disconnect();
}

rankTeams().catch(console.error);
