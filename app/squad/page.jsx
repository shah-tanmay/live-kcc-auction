'use client';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

// Helper to format currency/points
const formatPoints = (points) => {
    const val = parseInt(points);
    if (isNaN(val)) return points;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(2)}k`;
    return `₹${val}`;
};

// Helper to get team visual properties (Shared with Home)
const getTeamTheme = (teamName) => {
    if (!teamName) return { color: 'text-slate-600', bg: 'bg-slate-100', char: '?' };
    
    // Normalize string for matching
    const name = teamName.toLowerCase();
    
    // Checks for keywords in the team name
    if (name.includes('aj turf')) return { logo: '/logos/ajturf.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('champion')) return { logo: '/logos/champion.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('kcc')) return { logo: '/logos/kcc.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('kumar')) return { logo: '/logos/kumar.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('oswal')) return { logo: '/logos/oswal.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('solanki')) return { logo: '/logos/solanki.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('upadhyay')) return { logo: '/logos/upadhyay.jpg', color: 'text-slate-800', bg: 'bg-white' };
    if (name.includes('firehawks')) return { color: 'text-orange-600', bg: 'bg-orange-100', char: 'F' };
    
    // Fallback themes
    const themes = {
        'Titans': { color: 'text-blue-600', bg: 'bg-blue-100', char: 'T' },
        'Warriors': { color: 'text-green-600', bg: 'bg-green-100', char: 'W' },
        'Royals': { color: 'text-purple-600', bg: 'bg-purple-100', char: 'R' },
        'Kings': { color: 'text-red-600', bg: 'bg-red-100', char: 'K' },
        'Strikers': { color: 'text-yellow-600', bg: 'bg-yellow-100', char: 'S' },
        'Giants': { color: 'text-gray-600', bg: 'bg-gray-100', char: 'G' },
    };
    
    return themes[teamName] || { color: 'text-slate-600', bg: 'bg-slate-100', char: teamName?.[0] || '?' };
};

export default function SquadPage() {
    const router = useRouter();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const getTeams = async () => {
        try {
            const res = await fetch('/api/teams');
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
                // If no team selected yet, select the first one
                if (!selectedTeam && data.length > 0) {
                     setSelectedTeam(data[0]);
                } else if (selectedTeam) {
                    // Update currently selected team data to keep distinct sync
                    const updated = data.find(t => t._id === selectedTeam._id);
                    if (updated) setSelectedTeam(updated);
                }
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeams();
        const socket = io('/', { path: '/socket.io' });
        socket.on('playerSold', async () => {
            await getTeams();
        });
        return () => socket.disconnect();
    }, []);

    // Derived state for the selected team
    const currentTeamTheme = selectedTeam ? getTeamTheme(selectedTeam.name) : {};
    
    // Calculate stats
    const items = selectedTeam?.squad || [];
    const playersCount = items.length;
    
    // Use DB provided value for remaining purse
    // Fallback to 0 if undefined to avoid NaN
    const remainingPurse = selectedTeam?.purseLeft ?? 0;
    
    // Check if team has a 'totalPurse' field, otherwise estimate or calculate
    // Since we don't know the initial Total Purse from just 'purseLeft', 
    // we can calculate 'Spent' by summing player sold prices.
    const amountSpent = items.reduce((acc, player) => acc + (player.soldFor || 0), 0);

    return (
        <div className="bg-background-light text-slate-800 font-body h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
            {/* Header - Consistent with Home */}
            <header className="bg-white border-b border-slate-200 h-20 px-6 lg:px-8 flex items-center justify-between shadow-sm z-50 shrink-0 relative">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="size-16 flex items-center justify-center">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="h-full w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tighter text-slate-900 leading-none">KCC Season 5</h1>
                        <p className="text-[0.65rem] font-bold text-primary uppercase tracking-[0.2em]">Squad Center</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <button 
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                    >
                        Back to Auction
                    </button>
                </div>
                <div className="flex flex-col items-end">
                     {/* Placeholder or just reuse same look */}
                    <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-bold">Teams</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-black text-slate-900 leading-none">{teams.length}</span>
                        <span className="text-sm font-bold text-slate-300">Total</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden bg-slate-50/50">
                {/* Sidebar - Team List */}
                <aside className="hidden lg:flex lg:w-80 bg-white border-r border-slate-200 flex-col h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 shrink-0">
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Teams Overview</h3>
                            <span className="flex items-center justify-center size-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">{teams.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-2">
                        {teams.map((team) => {
                            const theme = getTeamTheme(team.name);
                            const isSelected = selectedTeam?._id === team._id;
                            return (
                                <button 
                                    key={team._id}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`w-full relative overflow-hidden flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all group ${
                                        isSelected 
                                        ? 'bg-gradient-to-r from-orange-50 to-white border-primary/30 shadow-sm' 
                                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                    }`}
                                >
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                                    
                                    {theme.logo ? (
                                         <div className={`flex-shrink-0 size-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1 shadow-sm ${isSelected ? 'shadow-md scale-105' : ''}`}>
                                            <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                         </div>
                                    ) : (
                                        <div className={`flex-shrink-0 size-12 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center font-black text-lg shadow-sm`}>
                                            {theme.char}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col items-start min-w-0 pr-6">
                                        <p className={`text-base font-bold leading-tight truncate w-full text-left ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {team.name}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-1">{team.squad?.length || 0} Players</p>
                                    </div>
                                    {isSelected && <span className="material-symbols-outlined absolute right-4 text-primary text-xl">chevron_right</span>}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
                    {selectedTeam ? (
                        <>
                            <div className="bg-white border-b border-slate-200 px-8 py-8 lg:px-12 lg:py-10 shrink-0">
                                <div className="max-w-[1600px] mx-auto w-full">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            {currentTeamTheme.logo ? (
                                                <div className="size-24 lg:size-28 flex items-center justify-center drop-shadow-xl bg-white rounded-2xl p-2 border border-slate-100">
                                                    <img src={currentTeamTheme.logo} alt={selectedTeam.name} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`size-24 lg:size-28 rounded-3xl ${currentTeamTheme.bg} ${currentTeamTheme.color} flex items-center justify-center shadow-inner ring-4 ring-white`}>
                                                    <span className="text-5xl font-black">{currentTeamTheme.char}</span>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">{selectedTeam.name}</h1>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                        <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                                        <span className="font-medium text-slate-700">Owner:</span> John Doe
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[160px]">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Budget Spent</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-slate-800">{formatPoints(amountSpent)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20 min-w-[160px] text-white">
                                                <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">Purse Remaining</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold">{formatPoints(remainingPurse)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8 mt-10 border-b border-slate-100">
                                        <button className="pb-3 text-primary border-b-2 border-primary font-semibold text-sm">
                                            Squad List ({playersCount})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">search</span>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Search player..." 
                                                className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {items.length > 0 ? items.map((player, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                            <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-200 to-slate-100 overflow-hidden">
                                                {/* Placeholder or Logic for Captain if data exists */}
                                                 {/* <div className="absolute top-3 left-3 z-10">
                                                    <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-yellow-300 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">star</span> CAPTAIN
                                                    </span>
                                                </div> */}
                                                
                                                {player.photoUrl ? (
                                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${player.photoUrl})` }}></div>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
                                                    </div>
                                                )}
                                                
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/50 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{player.role || 'Player'}</p>
                                                            <h3 className="font-bold text-slate-800 text-base leading-tight">{player.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 pt-3">
                                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Sold At</span>
                                                        <span className="text-lg font-bold text-primary">{formatPoints(player.soldFor)}</span>
                                                    </div>
                                                    {/* Placeholder for future detailed view */}
                                                    {/* <button className="size-8 rounded-full bg-white text-slate-400 hover:text-primary hover:bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-colors">
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <span className="material-symbols-outlined text-4xl mb-2">sports_cricket</span>
                                            <p>No players in this squad yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                             {loading ? (
                                 <p>Loading Teams...</p>
                             ) : (
                                 <>
                                    <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">groups</span>
                                    <p className="font-medium">Select a team to view their squad</p>
                                 </>
                             )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
