"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { formatPoints } from '@/utils/formatPoints';
import Cookies from 'js-cookie';
import confetti from 'canvas-confetti';
import LoadingScreen from '@/components/LoadingScreen';
import { getTeamTheme } from '@/utils/teamTheme';

export default function AdminDashboard() {
    const router = useRouter();
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidTeam, setCurrentBidTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [customBid, setCustomBid] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [lastAction, setLastAction] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/teams/purse');
            const data = await res.json();
            setTeams(data);
        } catch (error) {
            console.error("Failed to fetch teams", error);
        }
    };

    // Initial Data Fetch
    useEffect(() => {
        const token = Cookies.get('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }

        const init = async () => {
            await fetchTeams();
            setLoading(false);
        };
        init();

        // Firebase Listeners
        const bidRef = ref(db, 'auction/currentBid');
        const playerRef = ref(db, 'auction/currentPlayer');
        
        const unsubscribeBid = onValue(bidRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCurrentBid(data.amount === 'No Bids Yet' ? 0 : data.amount);
                setCurrentBidTeam(data.teamName === 'No Team Yet' ? null : data.teamName);
            }
        });

        const unsubscribePlayer = onValue(playerRef, (snapshot) => {
             const data = snapshot.val();
             if (data) setCurrentPlayer(data);
             else setCurrentPlayer(null);
        });

        const statusRef = ref(db, 'auction/status');
        const unsubscribeStatus = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (data.type === 'SOLD') {
                     confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    setLastAction('SOLD');
                    fetchTeams(); // Refetch teams to update Max Bid allowed
                } else if (data.type === 'UNSOLD') {
                    setLastAction('UNSOLD');
                }
            }
        });

        return () => {
            unsubscribeBid();
            unsubscribePlayer();
            unsubscribeStatus();
        };
    }, []);

    // Actions
    const handleNextPlayer = async () => {
        if (actionLoading) return;
        try {
            setActionLoading(true);
            const res = await fetch('/api/auction/next-player');
            const data = await res.json();
            if (data.message === 'All players sold') {
                alert('Auction Finished!');
            }
            setLastAction(null); // Clear action status
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBid = async (amount, teamId) => {
        if (!currentPlayer?._id) return alert('No active player');
        if (!teamId) return alert('Select a team first'); // Wait, UI needs team selection for manual bid? 
        // Admin Panel usually allows bidding on behalf of teams. 
        // The new UI provides buttons "+100", "+500" etc. BUT who is placing the bid?
        // The design in `admin.html` shows "Active Bidders" sidebar with "Place Bid" buttons for each team.
        // So I will implement the logic: Click "Place Bid" on sidebar -> Sets that team as "Active Bidder" -> Then click Amount?
        // OR Click "Place Bid" on sidebar automatically places a bid?
        // Let's look at the sidebar buttons: "Place Bid".
        // Let's assume the sidebar buttons trigger a default increment or open a modal?
        // Simpler implementation: Sidebar buttons place a bid of (Current + Base Increment).
        
        let bidValue = amount;
        if (!bidValue) {
             // Logic for auto-increment? 
             // Let's standard increment 100 or 500 depending on price range?
             // For now, let's just ask or use a default.
             // Better yet, the sidebar "Place Bid" button can probably just add min-increment.
             const current = typeof currentBid === 'number' ? currentBid : 0;
             bidValue = current + 100;
        }

        const targetTeam = teams.find(t => t.id === teamId);
        if (targetTeam && bidValue > targetTeam.maxBidAllowed) {
            return alert(`Bid ₹${bidValue} exceeds ${targetTeam.name}'s max allowed limit (₹${targetTeam.maxBidAllowed})`);
        }

        try {
            const res = await fetch('/api/auction/post-bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: currentPlayer._id,
                    teamId: teamId,
                    bidAmount: bidValue
                })
            });
            const data = await res.json();
            if (data.error) alert(data.error);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCustomBid = async () => {
        // This requires a selected team. 
        // Since the UI design separates "Increase Bid Amount" controls from "Active Bidders",
        // it implies there might be a "Selected Team" state suitable for the top controls.
        // However, standard auction flow usually involves clicking the team paddle.
        // Let's stick to the Sidebar "Place Bid" buttons for main interaction.
        // For the "Increase Bid" buttons in center, we need to know WHICH team.
        // Maybe we just disable them or make them assume "Last Bidder + Self"? No.
        // I will make the Sidebar buttons `Place +100 Bid`?
        // Let's adapt: Center buttons update a `bidIncrement` state? 
        // Or simpler: The center buttons are just for "Quick Add" but we need a team context.
        // I'll make the Sidebar "Place Bid" buttons explicitly ask for amount or add +100.
        // Let's implement simply: Sidebar "Place Bid" adds (Current + 100).
    };
    
    const handleSell = async () => {
        if (!currentPlayer?._id || actionLoading) return;
        try {
            setActionLoading(true);
            await fetch(`/api/players/${currentPlayer._id}/sell`, { method: 'POST' });
        } catch (e) { console.error(e); } 
        finally { setActionLoading(false); }
    };

    const handleUnsold = async () => {
        if (!currentPlayer?._id || actionLoading) return;
        try {
            setActionLoading(true);
            await fetch(`/api/players/${currentPlayer._id}/unsold`, { method: 'POST' });
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Avoid shortcuts if typing in input
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleNextPlayer();
            } else if (e.key.toLowerCase() === 's') {
                // 's' for Sold - requires manual check or just trigger if current bid exists
                // The Shortcuts section says 'S (Sold)'
                if (currentBidTeam && currentBidTeam !== 'No Team Yet') {
                    handleSell();
                } else {
                   // alert('Cannot mark SOLD without a valid bid/team.');
                }
            } else if (e.key.toLowerCase() === 'p') {
                handleUnsold(); // P for Pass/Unsold
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentBidTeam, currentPlayer]); // Re-bind on state change if needed

    // Manual Bid State
    const [manualBidTeam, setManualBidTeam] = useState('');
    const [manualBidAmount, setManualBidAmount] = useState('');

    const handleManualBidSubmit = async (overrideAmount) => {
        const teamId = manualBidTeam;
        const amount = overrideAmount || Number(manualBidAmount);

        if (!teamId) return alert('Please select a team for the manual bid.');
        if (!amount || amount <= 0) return alert('Enter a valid bid amount.');

        await handleBid(amount, teamId);
        setManualBidAmount(''); // Reset amount after bid? Optional.
    };

    const handleResetAuction = async () => {
        if (!confirm('Are you sure you want to RESET the Mock Auction? This will clear all bids and reset purses.')) return;
        try {
            setLoading(true);
            await fetch('/api/mock/seed', { method: 'POST' });
            alert('Mock Auction Reset Successfully!');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to reset auction');
        } finally {
            setLoading(false);
        }
    };

    // --- SIMULATION FUNCTIONS ---
    const simulateBid = () => {
        const teamNames = teams.length > 0 ? teams.map(t => t.name) : ['AJ Turf Titans', 'Oswal Champions', 'KCC Kings', 'Solanki Stars'];
        const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        const randomAmount = Math.floor(Math.random() * 100) * 1000 + 5000;
        
        set(ref(db, 'auction/currentBid'), {
            amount: randomAmount,
            teamName: randomTeam
        });
        set(ref(db, 'auction/status'), null);
    };

    const simulateNewPlayer = () => {
         const players = [
            { name: 'Virat Kohli', role: 'Batsman', photoUrl: '', stats: { matches: 200, runs: 12000, sr: 130, wickets: 0 } },
            { name: 'Jasprit Bumrah', role: 'Bowler', photoUrl: '', stats: { matches: 100, runs: 500, sr: 100, wickets: 150 } },
            { name: 'Rohit Sharma', role: 'Batsman', photoUrl: '', stats: { matches: 210, runs: 11000, sr: 140, wickets: 10 } }
        ];
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        
        set(ref(db, 'auction/currentPlayer'), randomPlayer);
        set(ref(db, 'auction/currentBid'), { amount: 'No Bids Yet', teamName: 'No Team Yet' });
        set(ref(db, 'auction/status'), null);
    };

    const simulateSold = () => {
        if (!currentPlayer) return alert('No active player to sell.');
        set(ref(db, 'auction/status'), {
            type: 'SOLD',
            data: {
                player: currentPlayer,
                amount: currentBid === 0 ? 50000 : currentBid,
                teamName: currentBidTeam === null ? 'AJ Turf Titans' : currentBidTeam
            }
        });
    };

    const simulateClear = async () => {
        if(confirm('Force Clear Firebase Auction Data?')) {
            await remove(ref(db, 'auction'));
        }
    };

    const toggleSim = () => setIsSimulating(!isSimulating);

    if (loading) return <LoadingScreen message="Initializing Admin Dashboard..." />;

    return (
        <div className="bg-surface-soft text-slate-900 flex flex-col h-screen overflow-hidden antialiased font-display">
            {/* Header */}
            <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-gray-200 px-6 py-3 bg-white shadow-sm z-30">
                <div className="flex items-center gap-4">
                     <div className="size-12 flex items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/10 border border-slate-100 overflow-hidden p-1">
                        <img src="/kcc_logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-slate-900 text-lg font-bold leading-none tracking-tight">KCC Season 5 Auction</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Admin Console • Live</span>
                        </div>
                    </div>
                    {/* Mock Mode Reset Button */}
                    {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' && (
                        <button 
                            onClick={handleResetAuction}
                            className="ml-4 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors"
                        >
                            Reset Mock Auction
                        </button>
                    )}
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                     <div className="hidden md:flex flex-col items-end border-r border-gray-200 pr-6">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Teams</span>
                        <span className="text-lg font-mono font-bold text-slate-800">{teams.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-3 pl-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-800">Admin User</div>
                                <div className="text-xs text-slate-500">Moderator</div>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200 border-2 border-white shadow-sm ring-1 ring-gray-200 flex items-center justify-center font-bold text-slate-500">
                                AD
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 sticky top-0 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-red-600 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">Live Auction</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="max-w-6xl mx-auto flex flex-col gap-6">
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                {currentPlayer ? (
                                    <>
                                        {/* Player Card */}
                                        <div className="xl:col-span-5 flex flex-col h-full">
                                            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl flex-1 flex flex-col relative group">
                                                <div className="relative h-72 w-full overflow-hidden bg-gray-100 items-end flex justify-center">
                                                    {/* Status Overlay */}
                                                    {(lastAction === 'SOLD') && (
                                                        <div className="absolute inset-0 z-20 bg-green-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
                                                            <div className="bg-white p-6 rounded-3xl shadow-2xl transform rotate-6 border-4 border-green-500 flex flex-col items-center gap-4">
                                                                <div className="text-green-600 font-black text-6xl tracking-tighter uppercase drop-shadow-md">SOLD</div>
                                                                <button 
                                                                    onClick={handleNextPlayer} 
                                                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 -rotate-6 hover:bg-black transition-colors"
                                                                >
                                                                    <span>Next Player</span>
                                                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(lastAction === 'UNSOLD') && (
                                                        <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
                                                            <div className="bg-white p-6 rounded-3xl shadow-2xl transform -rotate-6 border-4 border-slate-400 flex flex-col items-center gap-4">
                                                                <div className="text-slate-500 font-black text-6xl tracking-tighter uppercase drop-shadow-md">UNSOLD</div>
                                                                <button 
                                                                    onClick={handleNextPlayer} 
                                                                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 rotate-6 hover:bg-orange-700 transition-colors"
                                                                >
                                                                    <span>Next Player</span>
                                                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Loading Overlay */}
                                                    {actionLoading && (
                                                        <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <span className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
                                                                <span className="text-sm font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-full">Processing...</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {currentPlayer?.photoUrl ? (
                                                        <img src={currentPlayer.photoUrl} className="h-full w-auto object-contain" />
                                                    ) : (
                                                         <div className="flex items-center justify-center h-full w-full text-slate-300 font-bold text-4xl">?</div>
                                                    )}
                                                    
                                                    <div className="absolute top-4 left-4 flex gap-2">
                                                        <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-md shadow-md uppercase tracking-wider">Lot #--</span>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent">
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <h2 className="text-4xl font-bold text-white leading-tight mb-1 drop-shadow-md">{currentPlayer?.name || "Waiting..."}</h2>
                                                                <p className="text-white/80 text-sm font-medium">{currentPlayer?.role || "---"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-white relative">
                                                     <div className="absolute right-6 -top-10 bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-center min-w-[100px]">
                                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Base Price</div>
                                                        <div className="text-xl font-mono font-bold text-slate-900">{formatPoints(currentPlayer?.basePrice || 0)}</div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Matches</span>
                                                            <span className="text-xl font-bold text-slate-900">{currentPlayer?.stats?.matches || '-'}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Runs</span>
                                                            <span className="text-xl font-bold text-slate-900">{currentPlayer?.stats?.runs || '-'}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Wickets</span>
                                                            <span className="text-xl font-bold text-slate-900">{currentPlayer?.stats?.wickets || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bidding Controls */}
                                        <div className="xl:col-span-7 flex flex-col gap-6">
                                            <div className="bg-white rounded-3xl border border-gray-200 p-8 relative overflow-hidden shadow-xl">
                                                <div className="absolute right-0 top-0 size-64 bg-blue-50/50 rounded-bl-full pointer-events-none"></div>
                                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                                                    <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                                                                </div>
                                                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Bid</h3>
                                                            </div>
                                                            <div className="text-7xl font-bold text-slate-900 tracking-tighter leading-none">{formatPoints(currentBid)}</div>
                                                        </div>
                                                        {currentBidTeam && (
                                                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 min-w-[240px] shadow-sm">
                                                                <div className="text-blue-600/70 text-[10px] font-bold uppercase tracking-wider mb-2 text-right">Leading Team</div>
                                                                <div className="flex items-center justify-end gap-4">
                                                                    <div className="text-right">
                                                                        <div className="text-xl font-bold text-slate-900 leading-tight">{currentBidTeam}</div>
                                                                    </div>
                                                                    <div className={`size-14 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white shrink-0 ${getTeamTheme(currentBidTeam).bg} ${getTeamTheme(currentBidTeam).color}`}>
                                                                        {getTeamTheme(currentBidTeam).logo ? (
                                                                            <img src={getTeamTheme(currentBidTeam).logo} alt={currentBidTeam} className="w-full h-full object-contain p-1" />
                                                                        ) : (
                                                                            getTeamTheme(currentBidTeam).char
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Manual Bid Section - Refined Proportions */}
                                                    <div className="flex flex-col gap-5">
                                                         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/40 relative overflow-hidden group">
                                                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-primary to-orange-400"></div>
                                                           <div className="relative z-10">
                                                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                                                   Manual Bid Entry
                                                               </div>
                                                               <div className="flex flex-col gap-5">
                                                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                       <div className="w-full">
                                                                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-widest ml-1">Target Team</label>
                                                                           <div className="relative group/select">
                                                                               <select 
                                                                                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block p-3 shadow-sm appearance-none transition-all cursor-pointer group-hover/select:border-slate-300"
                                                                                   value={manualBidTeam}
                                                                                   onChange={(e) => setManualBidTeam(e.target.value)}
                                                                               >
                                                                                   <option value="">-- Select Team to Bid --</option>
                                                                                   {teams.map(t => (
                                                                                       <option key={t.id} value={t.id}>{t.name} (Max: {formatPoints(t.maxBidAllowed)})</option>
                                                                                   ))}
                                                                               </select>
                                                                               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                                   <span className="material-symbols-outlined text-lg">expand_more</span>
                                                                               </div>
                                                                           </div>
                                                                       </div>
                                                                       <div className="w-full">
                                                                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-widest ml-1">Bid Amount (₹)</label>
                                                                           <div className="relative group/input">
                                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg italic pt-0.5">₹</span>
                                                                               <input 
                                                                                   type="number" 
                                                                                   className="bg-slate-50 border border-slate-200 text-slate-900 text-lg font-mono font-black rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full p-3 pl-9 shadow-sm transition-all group-hover/input:border-slate-300" 
                                                                                   placeholder="Enter exact amount"
                                                                                   value={manualBidAmount}
                                                                                   onChange={(e) => setManualBidAmount(e.target.value)}
                                                                               />
                                                                           </div>
                                                                       </div>
                                                                   </div>

                                                                   <div className="flex flex-col xl:flex-row gap-3 items-stretch">
                                                                       <button 
                                                                           onClick={() => handleManualBidSubmit()}
                                                                           className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3.5 px-6 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base group/btn"
                                                                       >
                                                                           <span className="material-symbols-outlined text-orange-400 text-xl group-hover:translate-x-1 transition-transform">rocket_launch</span>
                                                                           <span>Confirm & Place Bid</span>
                                                                       </button>
                                                                       
                                                                       <div className="flex gap-2 shrink-0">
                                                                           <button 
                                                                               onClick={() => setManualBidAmount(currentBid === 0 ? (currentPlayer?.basePrice || 0) : Number(currentBid) + 100)} 
                                                                               className="flex-1 xl:w-28 bg-white border border-slate-200 hover:border-primary/50 hover:bg-orange-50/30 text-slate-700 font-black py-3.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-[10px] uppercase tracking-tighter"
                                                                           >
                                                                               {currentBid === 0 ? 'Start (BP)' : '+ 100'}
                                                                           </button>
                                                                           <button 
                                                                               onClick={() => setManualBidAmount(currentBid === 0 ? (currentPlayer?.basePrice || 0) + 500 : Number(currentBid) + 500)} 
                                                                               className="flex-1 xl:w-28 bg-white border border-slate-200 hover:border-primary/50 hover:bg-orange-50/30 text-slate-700 font-black py-3.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-[10px] uppercase tracking-tighter"
                                                                           >
                                                                               {currentBid === 0 ? 'Start + 500' : '+ 500'}
                                                                           </button>
                                                                       </div>
                                                                   </div>
                                                               </div>
                                                           </div>
                                                         </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-5 min-h-[120px] mt-2">
                                                    <button onClick={handleSell} className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-3xl border-2 border-white/10 transition-all shadow-xl shadow-green-100/50 flex flex-col items-center justify-center gap-1 hover:-translate-y-1.5 active:scale-95">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700 rotate-12">
                                                            <span className="material-symbols-outlined text-[80px]">verified</span>
                                                        </div>
                                                        <span className="material-symbols-outlined text-4xl mb-0.5 drop-shadow-md group-hover:scale-110 transition-transform">gavel</span>
                                                        <span className="text-2xl font-black tracking-tight uppercase leading-none">SOLD</span>
                                                        <span className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest mt-1 backdrop-blur-md">to {currentBidTeam || 'Highest Bidder'}</span>
                                                    </button>
                                                    <button onClick={handleUnsold} className="group relative overflow-hidden bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-3xl border-2 border-dashed border-slate-200 hover:border-red-200 transition-all flex flex-col items-center justify-center gap-1 hover:-translate-y-1.5 shadow-sm hover:shadow-lg active:scale-95">
                                                        <span className="material-symbols-outlined text-4xl mb-0.5 transition-colors group-hover:rotate-90 transition-transform duration-500">cancel</span>
                                                        <span className="text-xl font-black tracking-tight uppercase leading-none">UNSOLD</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400 group-hover:text-red-400">Skip Player</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-12 w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden min-h-[500px]">
                                         <PreAuctionLobby 
                                            teams={teams} 
                                            onStart={handleNextPlayer} 
                                            loading={actionLoading} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex-none bg-white border-t border-gray-200 p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Shortcuts</span>
                                <div className="flex gap-3">
                                    <span className="px-2.5 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">SPACE (Next)</span>
                                    <span className="px-2.5 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">S (Sold)</span>
                                    <span className="px-2.5 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">P (Pass)</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleNextPlayer}
                                className={`bg-primary hover:bg-blue-700 text-white font-bold text-lg pl-8 pr-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 flex items-center gap-3 transition-all transform active:scale-95 group ring-offset-2 ring-offset-white focus:ring-2 focus:ring-primary outline-none ${lastAction ? 'animate-bounce ring-4 ring-primary/50' : ''}`}
                            >
                                <span>{lastAction ? 'Next Player' : 'Get Next Player'}</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Active Bidders */}
                {currentPlayer && (
                    <aside className="hidden lg:flex flex-col w-80 border-l border-gray-200 bg-white shadow-xl z-20 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Teams</h3>
                            <span className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-md text-slate-800 font-bold shadow-sm">{teams.length} Teams</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {teams.map(team => {
                                const isHighest = team.name === currentBidTeam;
                                const theme = getTeamTheme(team.name, team.logoUrl);
                                return (
                                    <div key={team.id} className={`w-full text-left p-3 rounded-xl border transition-all group shadow-sm ${isHighest ? 'bg-white border-2 border-primary/20 shadow-lg shadow-blue-100' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`size-10 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0 ${theme.bg} ${theme.color}`}>
                                                    {theme.logo ? (
                                                        <img src={theme.logo} alt={team.name} className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        theme.char
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-slate-900 font-bold text-sm truncate">{team.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">Purse: <span className="font-mono text-slate-900">{formatPoints(team.remainingPurse)}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        {isHighest ? (
                                            <div className="text-xs text-primary font-bold bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                                                Highest Bidder
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => handleBid(currentBid === 0 ? (currentPlayer.basePrice || 0) : Number(currentBid) + 100, team.id)}
                                                    className="py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                                >
                                                    {currentBid === 0 ? 'Start' : '+100'}
                                                </button>
                                                <button 
                                                    onClick={() => handleBid(currentBid === 0 ? (currentPlayer.basePrice || 0) + 500 : Number(currentBid) + 500, team.id)}
                                                    className="py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                                >
                                                    {currentBid === 0 ? 'Start+500' : '+500'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                )}
            </div>

            {/* Simulation Controls (Mock Only) */}
            {isMock && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
                    {isSimulating && (
                        <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 mb-2 w-72 animate-in slide-in-from-bottom-5">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">science</span>
                                    Simulation Tools
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mock Mode</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={simulateNewPlayer} className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-between group">
                                    <span>1. New Player</span>
                                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                                </button>
                                <button onClick={simulateBid} className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-between group">
                                    <span>2. Place Random Bid</span>
                                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">trending_up</span>
                                </button>
                                <button onClick={simulateSold} className="px-4 py-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-between group">
                                    <span>3. Mark Sold</span>
                                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">gavel</span>
                                </button>
                                <button onClick={simulateClear} className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200 flex items-center justify-between group mt-2">
                                    <span>4. Wipe Firebase</span>
                                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">delete_forever</span>
                                </button>
                                <div className="text-[9px] text-slate-400 mt-3 leading-tight italic bg-slate-50 p-2 rounded-lg">
                                    * Real-time Firebase overrides only. Does not affect persistent MongoDB data.
                                </div>
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={toggleSim}
                        className={`size-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isSimulating ? 'bg-slate-900 rotate-90' : 'bg-primary hover:bg-orange-600'}`}
                        title="Simulation Tools"
                    >
                        <span className="material-symbols-outlined text-white text-2xl">
                            {isSimulating ? 'close' : 'build'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

// Pre-Auction Lobby Component
function PreAuctionLobby({ teams, onStart, loading }) {
    return (
        <div className="flex-1 p-2 lg:p-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl -mt-20 pointer-events-none"></div>
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 z-10 relative pb-10">
                <div className="text-center mt-4 lg:mt-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 shadow-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                        <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                        Starting Soon
                    </div>
                    <h1 className="font-display font-black text-4xl lg:text-6xl text-slate-900 tracking-tighter leading-none">
                        KCC Season 5
                        <span className="block text-xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 mt-1 tracking-tight">Player Auction</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base max-w-xl mx-auto leading-relaxed px-4">
                        Welcome to the official auction for KCC Season 5. Get ready as franchises battle it out to build their dream squads.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                        <button 
                            onClick={onStart}
                            disabled={loading}
                            className={`bg-primary hover:bg-orange-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 uppercase tracking-wider text-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
                        >
                            {loading ? (
                                <><span>Initialising...</span><span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span></>
                            ) : (
                                <><span>Start Auction</span><span className="material-symbols-outlined font-black">play_arrow</span></>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => window.location.href = '/players'}
                            className="bg-white border border-slate-200 hover:border-primary/50 text-slate-700 font-black py-4 px-10 rounded-2xl shadow-sm transition-all flex items-center gap-3 uppercase tracking-wider text-sm hover:-translate-y-1 active:scale-95"
                        >
                            <span>Players Pool</span>
                            <span className="material-symbols-outlined font-black text-primary">groups</span>
                        </button>
                    </div>
                </div>

                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full my-2"></div>

                <div className="w-full">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div>
                            <h2 className="font-display font-bold text-lg lg:text-xl text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-2xl">diversity_3</span>
                                Franchise Owners
                            </h2>
                            <p className="text-slate-400 text-[10px] mt-0.5 font-medium uppercase tracking-wider">Participating groups ready for the auction</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {teams.map((team, idx) => {
                            const theme = getTeamTheme(team.name, team.logoUrl);
                            return (
                                <div key={team.id || idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="flex items-start justify-between mb-4">
                                        {theme.logo ? (
                                            <div className="size-12 rounded-xl bg-white overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center p-1 group-hover:scale-110 transition-transform duration-300">
                                                <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className={`size-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-300 border border-white/10 ${theme.bg} ${theme.color}`}>
                                                {theme.char}
                                            </div>
                                        )}
                                    <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors text-lg">verified</span>
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-base text-slate-900 mb-0.5 group-hover:text-primary transition-colors">{team.name}</h3>
                                    <div className="h-px w-full bg-slate-50 my-2"></div>
                                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1 italic">Status</p>
                                    <p className="text-slate-700 text-xs font-bold flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Owner: {team.owner || 'Verified'}
                                    </p>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
