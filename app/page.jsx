'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { formatPoints } from '@/utils/formatPoints';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import MobileAuctionUI from '@/components/MobileAuctionUI';
import LoadingScreen from '@/components/LoadingScreen';
import { getTeamTheme } from '@/utils/teamTheme';

export default function AuctionUI() {
    const [currentBid, setCurrentBid] = useState('No Bids Yet');
    const [currentBidTeamName, setCurrentBidTeamName] = useState('No Team Yet');
    const [purseData, setPurseData] = useState([]);
    const [hasMounted, setHasMounted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [playerSold, setPlayerSold] = useState(null);
    const [unSold, setUnsoldData] = useState(null);
    const [topBids, setTopBids] = useState([]);
    const [unsoldPlayers, setUnsoldPlayers] = useState([]);
    const [remainingPlayersCount, setRemainingPlayers] = useState();
    const [isLoading, setIsLoading] = useState(true);
    
    // Simulation Mode State
    const [isMobile, setIsMobile] = useState(false);

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
            const res = await fetch('/api/teams/purse');
            if (res.ok) {
                const data = await res.json();
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
        
        // Initial Fetch
        const init = async () => {
             setIsLoading(true);
             const { get } = await import('firebase/database');
             
             // Concurrent fetch for API and Firebase
             const [snapshotPlayer, snapshotBid] = await Promise.all([
                get(ref(db, 'auction/currentPlayer')),
                get(ref(db, 'auction/currentBid')),
                fetchPurseData(),
                getTopBids(),
                getUnSoldPlayers(),
                remainingPlayers()
             ]);

             // Set initial firebase values to avoid wait sync flash
             if (snapshotPlayer.exists()) setCurrentPlayer(snapshotPlayer.val());
             if (snapshotBid.exists()) {
                const b = snapshotBid.val();
                setCurrentBid(b.amount);
                setCurrentBidTeamName(b.teamName);
             }

             setIsLoading(false);
        };
        init();

        // --- FIREBASE LISTENERS ---

        // 1. Current Bid Listener
        const bidRef = ref(db, 'auction/currentBid');
        const unsubscribeBid = onValue(bidRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCurrentBid(data.amount);
                setCurrentBidTeamName(data.teamName);
                if (data.amount === 'No Bids Yet') {
                     // Reset sold/unsold state if reset
                }
            }
        });

        // 2. Current Player Listener
        const playerRef = ref(db, 'auction/currentPlayer');
        const unsubscribePlayer = onValue(playerRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCurrentPlayer(data);
                // Reset states for new player
                setPlayerSold(null);
                setUnsoldData(null);
                setCurrentBid('No Bids Yet');
                setCurrentBidTeamName('No Team Yet');
            } else {
                setCurrentPlayer(null);
            }
        });

        // 3. Status Listener (Sold/Unsold events)
        const statusRef = ref(db, 'auction/status');
        const unsubscribeStatus = onValue(statusRef, async (snapshot) => {
            const status = snapshot.val();
            if (status) {
                if (status.type === 'SOLD') {
                    setPlayerSold(status.data);
                    
                    // Simple Confetti
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });

                    // Refresh lists
                    await getTopBids();
                    await fetchPurseData();
                    await remainingPlayers();
                } else if (status.type === 'UNSOLD') {
                    setUnsoldData(status.data);
                    await getUnSoldPlayers();
                    await remainingPlayers();
                }
            }
        });

        return () => {
            unsubscribeBid();
            unsubscribePlayer();
            unsubscribeStatus();
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    if (!hasMounted) return null;

    const currentTeamTheme = getTeamTheme(playerSold ? playerSold.teamName : currentBidTeamName);

    if (isMobile) {
        return (
            <>
                <MobileAuctionUI 
                    purseData={purseData}
                    currentBid={currentBid}
                    currentBidTeamName={currentBidTeamName}
                    currentPlayer={currentPlayer}
                    playerSold={playerSold}
                    unSold={unSold}
                    topBids={topBids}
                    unsoldPlayers={unsoldPlayers}
                    remainingPlayersCount={remainingPlayersCount}
                    formatPoints={formatPoints}
                    getTeamTheme={getTeamTheme}
                    router={router}
                    isLoading={isLoading}
                />
                
            </>
        );
    }

    return (
        <div className="bg-background-light text-slate-800 font-body h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white relative">
            
            {/* Initial Loading State */}
            {isLoading && <LoadingScreen message="Fetching Auction Real-time Data..." />}
            

            <header className="bg-white border-b border-slate-200 h-20 px-6 lg:px-8 flex items-center justify-between shadow-sm z-50 shrink-0 relative">
                <div className="flex items-center gap-6">
                    <div className="size-16 flex items-center justify-center">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="h-full w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tighter text-slate-900 leading-none">KCC Season 5</h1>
                        <p className="text-[0.65rem] font-bold text-primary uppercase tracking-[0.2em] mt-1.5">Live Auction Feed</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-6">
                    {currentPlayer && (
                        <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
                             <button onClick={() => router.push('/players')} className="flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">groups</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Players Pool</span>
                            </button>
                            <button onClick={() => router.push('/squad')} className="flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">diversity_3</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Squad Gallery</span>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">timer</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            {currentPlayer ? 'Live Bidding In Progress' : 'Status: Pre-Auction'}
                        </span>
                    </div>
                </div>
                {currentPlayer && (
                    <div className="flex flex-col items-end">
                        <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-bold">Remaining</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-display font-black text-slate-900 leading-none">{remainingPlayersCount ?? '--'}</span>
                            <span className="text-sm font-bold text-slate-300">Players</span>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>
                
                {!currentPlayer ? (
                    <div className="col-span-12 w-full bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
                        <PreAuctionLobby teams={purseData} />
                    </div>
                ) : (
                    <>
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
                                    const theme = getTeamTheme(team.name, team.logoUrl);
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
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-inner border border-white/20">
                                                <span className="material-icons-round text-2xl">local_fire_department</span>
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
                                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 pr-8">
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Base Price: <span className="text-slate-900 font-bold ml-1">{formatPoints(currentPlayer?.basePrice || 4000)}</span></p>
                                            {currentPlayer?.lastYearSoldPrice > 0 && (
                                                <div className="flex flex-col gap-0.5 mt-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.1em]">Last Season (Purse: 1L)</p>
                                                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                                        Sold at <span className="text-primary font-black text-sm">{formatPoints(currentPlayer.lastYearSoldPrice)}</span> to <span className="uppercase text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md ml-1 shadow-sm">{currentPlayer.lastYearSoldTeam}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {currentPlayer?.photoUrl && (
                                    <div className="relative w-full md:w-[45%] h-full bg-gradient-to-b from-slate-50 to-white md:bg-none shrink-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-50/50 md:rounded-l-[3rem] border-l border-white/50"></div>
                                        
                                        {/* Status Overlays */}
                                        {playerSold && (
                                            <div className="absolute inset-0 z-20 bg-green-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-500">
                                                <div className="bg-white p-4 rounded-3xl shadow-2xl transform rotate-6 border-4 border-green-500">
                                                    <div className="text-green-600 font-black text-6xl tracking-tighter uppercase">SOLD</div>
                                                </div>
                                            </div>
                                        )}
                                        {unSold && (
                                            <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-500">
                                                <div className="bg-white p-4 rounded-3xl shadow-2xl transform -rotate-6 border-4 border-slate-400">
                                                    <div className="text-slate-500 font-black text-6xl tracking-tighter uppercase">UNSOLD</div>
                                                </div>
                                            </div>
                                        )}
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
                    </>
                )}
            </main>
        </div>
    );
};

// Pre-Auction Lobby Component (Audience Version)
function PreAuctionLobby({ teams }) {
    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Helper to get team color
    const getTeamColor = (name) => {
        const theme = getTeamTheme(name);
        return theme.bg + ' ' + theme.color;
    };

    return (
        <div className="flex-1 p-2 lg:p-8 relative h-full overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl -mt-20 pointer-events-none"></div>
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 z-10 relative pb-10">
                <div className="text-center mt-4 lg:mt-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 shadow-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                        <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                        Auction Starting Soon
                    </div>
                    <h1 className="font-display font-black text-4xl lg:text-7xl text-slate-900 tracking-tighter leading-none">
                        KCC Season 5
                        <span className="block text-xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 mt-2 tracking-tight">Official Player Auction</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-lg max-w-2xl mx-auto leading-relaxed px-4">
                        Welcome to the official auction for KCC Season 5. Get ready as franchises battle it out to build their dream squads. The bidding will commence shortly.
                    </p>
                    
                    <button 
                        onClick={() => window.location.href = '/players'}
                        className="mt-4 inline-flex items-center gap-3 bg-white border border-slate-200 hover:border-primary/50 text-slate-700 font-black py-4 px-10 rounded-2xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-sm active:scale-95"
                    >
                        <span>View Players Pool</span>
                        <span className="material-symbols-outlined font-black text-primary">groups</span>
                    </button>
                </div>

                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full my-4"></div>

                <div className="w-full">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="font-display font-bold text-xl lg:text-2xl text-slate-900 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">diversity_3</span>
                                Participating Franchises
                            </h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wider">Owner groups ready for the battle</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Skeleton Loader */}
                        {teams.length === 0 && Array(8).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="size-14 rounded-2xl bg-slate-100"></div>
                                    <div className="size-8 rounded-full bg-slate-100"></div>
                                </div>
                                <div className="h-4 w-3/4 bg-slate-100 rounded mb-4"></div>
                                <div className="h-px w-full bg-slate-50 my-3"></div>
                                <div className="flex justify-between">
                                    <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
                                    <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        ))}

                        {/* Real Teams */}
                        {teams.map((team, idx) => {
                             const theme = getTeamTheme(team.name, team.logoUrl);
                             return (
                                <div key={team.id || idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="flex items-start justify-between mb-5">
                                        {theme.logo ? (
                                            <div className="size-14 rounded-2xl bg-white overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center p-1 group-hover:scale-110 transition-transform duration-300">
                                                <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 border border-white/10 ${theme.bg} ${theme.color}`}>
                                                {theme.char || getInitials(team.name)}
                                            </div>
                                        )}
                                        <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors text-lg">verified</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors truncate">{team.name}</h3>
                                        <div className="h-px w-full bg-slate-50 my-3"></div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Status</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span className="text-xs font-bold text-slate-600">Owner: {team.owner || 'Verified'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Purse</p>
                                                <p className="text-xs font-black text-slate-900">{formatPoints(team.remainingPurse)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}

                        {/* Mystery Team Card - 'Revealing Soon' */}
                        {process.env.NEXT_PUBLIC_SHOW_MYSTERY_TEAM === 'true' && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-4 ring-slate-50">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-transparent to-transparent opacity-50"></div>
                                
                                <div className="flex items-start justify-between mb-5 relative z-10">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-400 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-3xl animate-pulse text-slate-400">que_mark</span>
                                    </div>
                                    <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[0.65rem] font-black uppercase tracking-widest border border-slate-200">
                                        Soon
                                    </div>
                                </div>
                                
                                <div className="relative z-10">
                                    <h3 className="font-display font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors">Revealing Soon...</h3>
                                    <p className="text-xs text-slate-500 font-medium">New Franchise</p>
                                    
                                    <div className="h-px w-full bg-slate-100 my-3"></div>
                                    
                                    <div className="flex items-center justify-between opacity-50 blur-[2px] group-hover:blur-none transition-all duration-500 cursor-help">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Owner</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-slate-600">Hidden</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Purse</p>
                                            <p className="text-xs font-black text-slate-600">--</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Button component for the Squad link to replace MUI button
const Button = ({ children, onClick, className }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors ${className}`}
    >
        {children}
    </button>
);
