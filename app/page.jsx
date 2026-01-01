'use client';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { formatPoints } from '@/utils/formatPoints';
import { useRouter } from 'next/navigation';

// Helper to get team visual properties
// Helper to get team visual properties
// Helper to get team visual properties
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

export default function AuctionUI() {
    const [currentBid, setCurrentBid] = useState('No Bids Yet');
    const [currentBidTeamName, setCurrentBidTeamName] = useState('No Team Yet');
    const [purseData, setPurseData] = useState([]);
    const [hasMounted, setHasMounted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState({
        name: 'Ansh Solanki',
        role: 'Batsman',
        photoUrl: '/players/anshsolanki.jpg',
        stats: { matches: 84, runs: 2450, sr: 145, wickets: 32 }
    });
    const [playerSold, setPlayerSold] = useState(null);
    const [unSold, setUnsoldData] = useState(null);
    const [topBids, setTopBids] = useState([]);
    const [unsoldPlayers, setUnsoldPlayers] = useState([]);
    const [remainingPlayersCount, setRemainingPlayers] = useState();
    const router = useRouter();

    const remainingPlayers = async () => {
        try {
            const res = await fetch('/api/auction/remaining');
            if (res.ok) {
                const data = await res.json();
                setRemainingPlayers(data.count);
            }
        } catch (error) {
            console.error("Failed to fetch remaining players:", error);
        }
    };

    const fetchPurseData = async () => {
        try {
            // Using the specific purse endpoint which returns calculated data
            const res = await fetch('/api/teams/purse');
            if (res.ok) {
                const data = await res.json();
                // Map the API data to the structure we need (though it likely matches)
                // The API returns { id, name, remainingPurse, maxBidAllowed }
                // We just need to make sure we use these keys
                setPurseData(data);
            }
        } catch (error) {
            console.error("Failed to fetch purse data:", error);
        }
    };

    const getTopBids = async () => {
        try {
            const res = await fetch('/api/players/sold/top');
            if (res.ok) {
                const data = await res.json();
                setTopBids(data.players);
            }
        } catch (error) {
            console.error("Failed to fetch top bids:", error);
        }
    };

    const getUnSoldPlayers = async () => {
        try {
            const res = await fetch('/api/players/unsold');
            if (res.ok) {
                const data = await res.json();
                setUnsoldPlayers(data.players);
            }
        } catch (error) {
            console.error("Failed to fetch unsold players:", error);
        }
    };

    useEffect(() => {
        setHasMounted(true);
        const socket = io('/', { path: '/socket.io' });

        fetchPurseData();
        getTopBids();
        getUnSoldPlayers();
        remainingPlayers();

        socket.on('newBid', (data) => {
            setCurrentBid(data.amount);
            setCurrentBidTeamName(data.teamName);
        });

        socket.on('newPlayer', (data) => {
            setCurrentPlayer(data.player);
            setPlayerSold(null);
            setCurrentBid('No Bids Yet');
            setCurrentBidTeamName('No Team Yet');
            setUnsoldData(null);
            remainingPlayers();
        });

        socket.on('playerSold', async (data) => {
            setPlayerSold(data);
            await getTopBids();
            await fetchPurseData(); // Refresh purses when player is sold
            await remainingPlayers();
        });

        socket.on('playerUnSold', async (data) => {
            setUnsoldData(data);
            await getUnSoldPlayers();
            await remainingPlayers();
        });
    }, []);

    if (!hasMounted) return null;

    const currentTeamTheme = getTeamTheme(playerSold ? playerSold.teamName : currentBidTeamName);

    return (
        <div className="bg-background-light text-slate-800 font-body h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
            <header className="bg-white border-b border-slate-200 h-20 px-6 lg:px-8 flex items-center justify-between shadow-sm z-50 shrink-0 relative">
                <div className="flex items-center gap-4">
                    <div className="size-16 flex items-center justify-center">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="h-full w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tighter text-slate-900 leading-none">KCC Season 5</h1>
                        <p className="text-[0.65rem] font-bold text-primary uppercase tracking-[0.2em]">Live Auction Feed</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">timer</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Bidding In Progress</span>
                    <Button variant='contained' color='primary' className="ml-4" onClick={() => router.push('/squad')}>
                            Squad
                    </Button>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-bold">Remaining</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-black text-slate-900 leading-none">{remainingPlayersCount ?? '--'}</span>
                        <span className="text-sm font-bold text-slate-300">Players</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>
                
                {/* Team Purses Sidebar */}
                <aside className="hidden lg:flex lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm flex-col overflow-hidden h-full z-10">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                        <h2 className="font-display font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            Team Purses
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                        {purseData.map((team, idx) => {
                            const theme = getTeamTheme(team.name);
                            return (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-primary/20 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {theme.logo ? (
                                            <div className="size-9 rounded-lg bg-white overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center p-0.5 shrink-0">
                                                <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className={`size-9 rounded-lg ${theme.bg} ${theme.color} flex items-center justify-center font-black text-sm shadow-inner shrink-0`}>{theme.char}</div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-slate-700 group-hover:text-primary transition-colors truncate">{team.name}</span>
                                            <span className="text-[0.6rem] text-slate-400 uppercase font-bold truncate">Max Bid: {formatPoints(team.maxBidAllowed)}</span>
                                        </div>
                                    </div>
                                    <span className="font-display font-bold text-slate-900 ml-2">{formatPoints(team.remainingPurse)}</span>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Center Content */}
                <section className="col-span-1 lg:col-span-6 flex flex-col gap-6 h-full z-20">
                    {/* Current Bid Card */}
                    <div className="relative shrink-0 z-20 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/25 border-4 border-primary/20 p-8 lg:p-10 flex flex-col items-center justify-center text-center overflow-hidden min-h-[340px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50 via-white to-white opacity-80 pointer-events-none"></div>
                        <div className="absolute -top-24 -right-24 size-48 bg-primary/5 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-24 -left-24 size-48 bg-secondary/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                                <span className="font-bold text-slate-400 uppercase tracking-[0.25em] text-xs">
                                     {playerSold ? 'PLAYER SOLD' : unSold ? 'PLAYER UNSOLD' : 'Current High Bid'}
                                </span>
                            </div>
                            <div className="font-display font-black text-6xl lg:text-[6rem] xl:text-[7rem] leading-none text-slate-900 tracking-tighter mb-8 scale-110 origin-center drop-shadow-sm">
                                {formatPoints(currentBid)}
                            </div>
                            {(currentBidTeamName !== 'No Team Yet' || playerSold) && (
                                <div className="flex items-center gap-4 bg-slate-900 text-white pl-2 pr-8 py-2.5 rounded-full shadow-xl transform transition-transform hover:scale-105 ring-4 ring-slate-100">
                                    <div className={`size-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-inner border border-white/20`}>
                                        <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                                    </div>
                                    <div className="text-left leading-tight">
                                        <span className="block text-[0.6rem] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                                            {playerSold ? 'Sold To' : 'Held By'}
                                        </span>
                                        <span className="block font-display font-bold text-xl tracking-tight">
                                            {playerSold ? playerSold.teamName : currentBidTeamName}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Player Card */}
                    <div className="flex-1 min-h-0 relative bg-white rounded-[2rem] shadow-lg border border-slate-200 overflow-hidden group flex flex-col md:flex-row">
                        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between relative z-10 h-full">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    {currentPlayer?.role && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[0.65rem] font-bold uppercase tracking-wider border border-blue-100 shadow-sm">
                                            <span className="material-symbols-outlined text-sm">sports_cricket</span>
                                            {currentPlayer.role}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-display font-black text-slate-900 uppercase leading-[0.9] tracking-tighter">
                                    {currentPlayer?.name || 'Waiting...'} 
                                </h2>
                            </div>
                            <div className="mt-auto">
                                <div className="grid grid-cols-4 gap-2 lg:gap-6 mb-4 max-w-md">
                                    <div>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Mat</p>
                                        <p className="text-2xl font-black text-slate-800">{currentPlayer?.stats?.matches || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Runs</p>
                                        <p className="text-2xl font-black text-slate-800">{currentPlayer?.stats?.runs || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold mb-0.5">SR</p>
                                        <p className="text-2xl font-black text-slate-800">{currentPlayer?.stats?.sr || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Wkts</p>
                                        <p className="text-2xl font-black text-slate-800">{currentPlayer?.stats?.wickets || '-'}</p>
                                    </div>
                                </div>
                                <div className="inline-block pt-3 border-t border-slate-100 pr-8">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Base Price: <span className="text-slate-900 font-bold ml-1">{formatPoints(2000)}</span></p>
                                </div>
                            </div>
                        </div>
                        {currentPlayer?.photoUrl && (
                             <div className="relative w-full md:w-[45%] h-full bg-gradient-to-b from-slate-50 to-white md:bg-none shrink-0 overflow-hidden">
                                <div className="absolute inset-0 bg-slate-50/50 md:rounded-l-[3rem] border-l border-white/50"></div>
                                <span className="absolute top-10 right-4 font-display font-black text-9xl text-slate-100 -rotate-90 origin-top-right select-none opacity-50">
                                    {currentPlayer.name.split(' ')[0]}
                                </span>
                                <img 
                                    alt="Player" 
                                    className="absolute bottom-0 right-0 h-[115%] w-auto max-w-none object-contain drop-shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105 origin-bottom-right md:right-[-10px]" 
                                    src={currentPlayer.photoUrl} 
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Sidebar - Top Bids & Unsold */}
                <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full z-10">
                    {/* Top Bids */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                            <h2 className="font-display font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="material-symbols-outlined text-green-600">trending_up</span>
                                Top 5 Bids
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 no-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 font-bold text-[0.65rem] uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-2">Player</th>
                                        <th className="px-5 py-2">Team</th>
                                        <th className="px-5 py-2 text-right">Bid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topBids.length > 0 ? topBids.slice(0, 5).map((bid, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-slate-700">{bid.player}</td>
                                            <td className="px-5 py-3 text-slate-500 text-xs font-bold uppercase">{bid.team || '-'}</td>
                                            <td className="px-5 py-3 text-right font-black text-slate-900">{formatPoints(bid.amount)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-3 text-center text-slate-400">No bids yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unsold Players */}
                    <div className="h-1/3 min-h-[200px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                            <h2 className="font-display font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="material-symbols-outlined text-slate-400">gavel</span>
                                Unsold Players
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {unsoldPlayers.length > 0 ? unsoldPlayers.map((player, i) => (
                                <div key={i} className="px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100 text-sm font-semibold text-slate-600 flex justify-between items-center group hover:border-slate-300 transition-colors">
                                    <span>{player.name}</span>
                                    <span className="text-[0.6rem] uppercase tracking-wider font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">{player.role}</span>
                                </div>
                            )) : (
                                <div className="text-center text-slate-400 text-xs py-2">No unsold players</div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};
// Simple Button component for the Squad link to replace MUI button
const Button = ({ children, onClick, className }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors ${className}`}
    >
        {children}
    </button>
);
