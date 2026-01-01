"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { formatPoints } from '@/utils/formatPoints';
import Cookies from 'js-cookie';
import confetti from 'canvas-confetti';

// Basic Team Theme Helper (Simplified for Admin)
const getTeamColor = (name) => {
    if (!name) return 'bg-gray-200 text-gray-600';
    if (name.includes('MI') || name.includes('Mumbai')) return 'bg-blue-900 text-white';
    if (name.includes('CSK') || name.includes('Chennai')) return 'bg-yellow-500 text-white';
    if (name.includes('RCB') || name.includes('Royal')) return 'bg-red-700 text-white';
    if (name.includes('KKR') || name.includes('Kolkata')) return 'bg-purple-800 text-white';
    if (name.includes('RR') || name.includes('Rajasthan')) return 'bg-pink-600 text-white';
    if (name.includes('SRH') || name.includes('Sunrisers')) return 'bg-orange-500 text-white';
    if (name.includes('DC') || name.includes('Delhi')) return 'bg-blue-600 text-white';
    if (name.includes('PBKS') || name.includes('Punjab')) return 'bg-red-500 text-white';
    if (name.includes('LSG') || name.includes('Lucknow')) return 'bg-cyan-600 text-white';
    if (name.includes('GT') || name.includes('Gujarat')) return 'bg-teal-700 text-white';
    return 'bg-gray-700 text-white';
}

const getTeamInitial = (name) => {
    if (!name) return '?';
    if (name.includes('Mumbai')) return 'MI';
    if (name.includes('Chennai')) return 'CSK';
    if (name.includes('Royal')) return 'RCB';
    if (name.includes('Kolkata')) return 'KKR';
    if (name.includes('Rajasthan')) return 'RR';
    return name.substring(0, 2).toUpperCase();
}

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

    // Initial Data Fetch
    useEffect(() => {
        const token = Cookies.get('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }

        const fetchInitialData = async () => {
            try {
                // Fetch Teams & Purses
                const res = await fetch('/api/teams/purse');
                const data = await res.json();
                setTeams(data);
                
                // Fetch Current Player (if any logic exists, or rely on firebase mostly)
                // For now relying on Firebase listener below
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

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

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                                {/* Player Card */}
                                <div className="xl:col-span-12 flex flex-col">
                                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl flex-1 flex flex-col relative group h-full">
                                        {!currentPlayer ? (
                                            <div className="h-72 w-full flex flex-col items-center justify-center bg-gray-50 gap-4 relative">
                                                <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-4xl">sports_cricket</span>
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-400">Auction Not Started</h2>
                                                <button 
                                                    onClick={handleNextPlayer}
                                                    disabled={actionLoading}
                                                    className={`bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform flex items-center gap-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                                >
                                                    {actionLoading ? (
                                                        <><span>Loading...</span><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span></>
                                                    ) : (
                                                        <><span>Start Auction (Get First Player)</span><span className="material-symbols-outlined">play_arrow</span></>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                        <>
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
                                        </>
                                        )}
                                    </div>
                                </div>

                                {/* Bidding Controls - Full Width */}
                                <div className="xl:col-span-12 flex flex-col gap-6">
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
                                                            <div className={`size-14 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-white shrink-0 ${getTeamColor(currentBidTeam)}`}>
                                                                {getTeamInitial(currentBidTeam)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Manual Bid Section - Redesigned */}
                                            <div className="flex flex-col gap-5">
                                                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Manual Bid Entry</div>
                                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                                        <div className="flex-1 w-full">
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Select Team</label>
                                                            <select 
                                                                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3"
                                                                value={manualBidTeam}
                                                                onChange={(e) => setManualBidTeam(e.target.value)}
                                                            >
                                                                <option value="">-- Choose Team --</option>
                                                                {teams.map(t => (
                                                                    <option key={t.id} value={t.id}>{t.name} (Purse: {formatPoints(t.remainingPurse)})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="w-full md:w-48">
                                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Bid Amount</label>
                                                            <input 
                                                                type="number" 
                                                                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3 font-mono" 
                                                                placeholder="Enter amount"
                                                                value={manualBidAmount}
                                                                onChange={(e) => setManualBidAmount(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleManualBidSubmit()}
                                                                className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                                                            >
                                                                <span>Place Bid</span>
                                                            </button>
                                                            {/* Quick Increments for Selected Team */}
                                                            <button onClick={() => setManualBidAmount(Number(currentBid || 0) + 100)} className="bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 font-bold py-3 px-3 rounded-xl transition-colors text-xs">+100</button>
                                                            <button onClick={() => setManualBidAmount(Number(currentBid || 0) + 500)} className="bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 font-bold py-3 px-3 rounded-xl transition-colors text-xs">+500</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 flex-1 min-h-[140px] mt-4">
                                                <button onClick={handleSell} className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-3xl border border-green-400/30 transition-all shadow-lg hover:shadow-green-500/30 flex flex-col items-center justify-center gap-2 hover:-translate-y-1">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 rotate-12">
                                                        <span className="material-symbols-outlined text-9xl">check_circle</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-5xl mb-1 drop-shadow-sm">gavel</span>
                                                    <span className="text-3xl font-black tracking-wide">SOLD</span>
                                                    <span className="text-sm bg-white/20 px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">to {currentBidTeam || 'Highest Bidder'}</span>
                                                </button>
                                                <button onClick={handleUnsold} className="group relative overflow-hidden bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-3xl border-2 border-dashed border-gray-300 hover:border-red-300 transition-all flex flex-col items-center justify-center gap-2 hover:-translate-y-1 shadow-sm hover:shadow-md">
                                                    <span className="material-symbols-outlined text-5xl mb-1 transition-colors">do_not_disturb_on</span>
                                                    <span className="text-2xl font-bold tracking-wide text-gray-500 group-hover:text-red-600">UNSOLD</span>
                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide group-hover:text-red-400">Pass this player</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                <aside className="hidden lg:flex flex-col w-80 border-l border-gray-200 bg-white shadow-xl z-20">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Teams</h3>
                        <span className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-md text-slate-800 font-bold shadow-sm">{teams.length} Teams</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                        {teams.map(team => {
                            const isHighest = team.name === currentBidTeam;
                            // const teamColorClass = getTeamColor(team.name);
                            return (
                                <div key={team.id} className={`w-full text-left p-3 rounded-xl border transition-all group shadow-sm ${isHighest ? 'bg-white border-2 border-primary/20 shadow-lg shadow-blue-100' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`size-10 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0 ${getTeamColor(team.name)}`}>
                                                {getTeamInitial(team.name)}
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
                                                onClick={() => handleBid((Number(currentBid)||0) + 100, team.id)}
                                                disabled={(Number(currentBid)||0) + 100 > team.maxBidAllowed}
                                                className={`font-bold py-2 rounded-lg border text-xs transition-colors ${(Number(currentBid)||0) + 100 > team.maxBidAllowed ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-600 border-gray-200'}`}
                                            >
                                                +100
                                            </button>
                                            <button 
                                                onClick={() => handleBid((Number(currentBid)||0) + 500, team.id)}
                                                disabled={(Number(currentBid)||0) + 500 > team.maxBidAllowed}
                                                className={`font-bold py-2 rounded-lg border text-xs transition-colors ${(Number(currentBid)||0) + 500 > team.maxBidAllowed ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-600 border-gray-200'}`}
                                            >
                                                +500
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </div>
    );
}
