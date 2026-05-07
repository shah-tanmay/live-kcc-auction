import connectToDB from '@/lib/db';
import { getModel } from '@/lib/getModel';

// Calculate player quality score from stats
function calculatePlayerQuality(player) {
    const stats = player.stats || {};
    let score = 0;
    
    // Batting prowess (max 50 points)
    const runs = stats.runs || 0;
    const battingAvg = stats.avg || stats.battingAverage || 0;
    const strikeRate = stats.sr || stats.strikeRate || 0;
    const matches = stats.matches || 1;
    
    if (runs > 0) {
        score += Math.min((runs / 100), 20); // Max 20 for runs
        score += Math.min((battingAvg / 2), 15); // Max 15 for average
        score += Math.min((strikeRate / 10), 15); // Max 15 for strike rate
    }
    
    // Bowling prowess (max 50 points)
    const wickets = stats.wickets || 0;
    const bowlingAvg = stats.bowlingAverage || 0;
    const economy = stats.economy || 0;
    
    if (wickets > 0) {
        score += Math.min((wickets / 2), 20); // Max 20 for wickets
        if (bowlingAvg > 0) {
            score += Math.min((30 / bowlingAvg), 15); // Max 15 for bowling avg (lower is better)
        }
        if (economy > 0) {
            score += Math.min((10 / economy), 15); // Max 15 for economy (lower is better)
        }
    }
    
    // Experience bonus (max 10 points)
    score += Math.min((matches / 10), 10);
    
    return Math.min(score, 100); // Cap at 100
}

export async function GET(request) {
    try {
        await connectToDB();
        const Team = getModel('Team');
        const teams = await Team.find().populate("squad").lean();
        
        // Calculate team rankings based on player stats
        const teamAnalysis = teams.map(team => {
            const squad = team.squad || [];
            
            // Calculate player quality scores
            const playerQualities = squad.map(player => ({
                ...player,
                quality: calculatePlayerQuality(player)
            }));
            
            // Calculate aggregate stats
            let totalQuality = 0;
            let totalRuns = 0;
            let totalWickets = 0;
            let totalExperience = 0;
            let totalBattingAvg = 0;
            let totalBowlingAvg = 0;
            let totalStrikeRate = 0;
            let battingCount = 0;
            let bowlingCount = 0;
            let allRounders = 0;
            let powerHitters = 0; // SR > 140
            let economicalBowlers = 0; // Economy < 7
            
            playerQualities. forEach(player => {
                totalQuality += player.quality;
                const stats = player.stats || {};
                
                totalRuns += stats.runs || 0;
                totalWickets += stats.wickets || 0;
                totalExperience += stats.matches || 0;
                
                if (stats.runs > 0) {
                    totalBattingAvg += stats.avg || stats.battingAverage || 0;
                    totalStrikeRate += stats.sr || stats.strikeRate || 0;
                    battingCount++;
                    
                    if ((stats.sr || stats.strikeRate || 0) > 140) {
                        powerHitters++;
                    }
                }
                
                if (stats.wickets > 0) {
                    totalBowlingAvg += stats.bowlingAverage || 0;
                    bowlingCount++;
                    
                    if ((stats.economy || 0) < 7 && stats.economy > 0) {
                        economicalBowlers++;
                    }
                }
                
                if (stats.runs > 0 && stats.wickets > 0) {
                    allRounders++;
                }
            });
            
            const avgQuality = squad.length > 0 ? totalQuality / squad.length : 0;
            const avgBattingAvg = battingCount > 0 ? totalBattingAvg / battingCount : 0;
            const avgBowlingAvg = bowlingCount > 0 ? totalBowlingAvg / bowlingCount : 0;
            const avgStrikeRate = battingCount > 0 ? totalStrikeRate / battingCount : 0;
            const avgExperience = squad.length > 0 ? totalExperience / squad.length : 0;
            
            // Comprehensive scoring system
            // Player Quality (35%), Stats Performance (35%), Team Balance (20%), Experience (10%)
            const qualityScore = avgQuality * 0.35; // Max 35
            const statsScore = (
                (totalRuns / 1000) * 10 + // Runs contribution
                (totalWickets / 50) * 10 + // Wickets contribution
                (avgBattingAvg / 5) * 7.5 + // Batting average
                (avgStrikeRate / 20) * 7.5 // Strike rate
            ); // Max ~35
            const balanceScore = (
                (allRounders / Math.max(squad.length, 1)) * 10 + // All-rounder ratio
                (powerHitters / Math.max(squad.length, 1)) * 5 + // Power hitters
                (economicalBowlers / Math.max(squad.length, 1)) * 5 // Economical bowlers
            ); // Max 20
            const experienceScore = avgExperience / 10; // Max ~10
            
            const totalScore = qualityScore + statsScore + balanceScore + experienceScore;
            
            return {
                name: team.name,
                squadSize: squad.length,
                purseLeft: team.purseLeft,
                avgQuality: parseFloat(avgQuality.toFixed(1)),
                totalRuns,
                totalWickets,
                avgBattingAvg: parseFloat(avgBattingAvg.toFixed(2)),
                avgBowlingAvg: parseFloat(avgBowlingAvg.toFixed(2)),
                avgStrikeRate: parseFloat(avgStrikeRate.toFixed(2)),
                avgExperience: parseFloat(avgExperience.toFixed(1)),
                allRounders,
                powerHitters,
                economicalBowlers,
                totalScore: parseFloat(totalScore.toFixed(2)),
                topPlayers: playerQualities
                    .sort((a, b) => b.quality - a.quality)
                    .slice(0, 5)
                    .map(p => ({
                        name: p.name,
                        quality: parseFloat(p.quality.toFixed(1)),
                        soldFor: p.soldFor || 0,
                        runs: p.stats?.runs || 0,
                        wickets: p.stats?.wickets || 0,
                        matches: p.stats?.matches || 0
                    }))
            };
        });
        
        // Sort by total score
        teamAnalysis.sort((a, b) => b.totalScore - a.totalScore);
        
        return Response.json({ rankings: teamAnalysis });
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
