'use client';
import React from 'react';

const MobileAuctionUI = ({
    purseData,
    currentBid,
    currentBidTeamName,
    currentPlayer,
    playerSold,
    unSold,
    topBids,
    unsoldPlayers,
    remainingPlayersCount,
    formatPoints,
    getTeamTheme,
    router
}) => {
    const currentTeamTheme = getTeamTheme(playerSold ? playerSold.teamName : currentBidTeamName);

    return (
        <div className="bg-[#F3F4F6] text-gray-800 font-body min-h-screen pb-20 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-0.5">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-display font-black text-xl leading-none text-gray-900 tracking-tighter uppercase">KCC SEASON 5</h1>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Auction Feed</span>
                    </div>
                </div>
                {currentPlayer && (
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Remaining</p>
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="font-display font-bold text-2xl text-gray-900 leading-none">{remainingPlayersCount ?? '--'}</span>
                            <span className="text-xs text-gray-400 font-medium">Players</span>
                        </div>
                    </div>
                )}
            </header>

            <main className="px-4 pt-6 space-y-6">
                {!currentPlayer ? (
                    <MobilePreAuctionLobby teams={purseData} getTeamTheme={getTeamTheme} formatPoints={formatPoints} />
                ) : (
                    <>
                        {/* Live Status Indicator */}
                        <div className="flex items-center justify-center gap-2 py-1">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {playerSold ? 'PLAYER SOLD' : unSold ? 'PLAYER UNSOLD' : 'Live Bidding In Progress'}
                            </span>
                        </div>

                        {/* Current Bid Card */}
                        <div className="bg-white rounded-3xl p-1 shadow-md border border-orange-100 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-primary to-orange-300"></div>
                            <div className="bg-gradient-to-br from-orange-50/50 to-white/50 rounded-[1.3rem] p-6 text-center relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-60"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-1.5 mb-2 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm border border-orange-100">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            {playerSold ? 'SOLD PRICE' : unSold ? 'LAST BID' : 'Current High Bid'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center font-display font-bold text-gray-900 mt-2 mb-6">
                                        <span className="text-7xl tracking-tight drop-shadow-sm">{formatPoints(currentBid)}</span>
                                    </div>

                                    {(currentBidTeamName !== 'No Team Yet' || playerSold) && (
                                        <div className="bg-gray-900 text-white rounded-2xl p-1.5 inline-flex items-center pr-5 shadow-xl shadow-gray-200 max-w-full">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                                <span className="material-icons-round text-white text-xl">local_fire_department</span>
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
                                                    {playerSold ? 'Sold To' : 'Held By'}
                                                </p>
                                                <p className="font-display font-bold text-xl leading-none truncate">
                                                    {playerSold ? playerSold.teamName : currentBidTeamName}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Player Card */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
                            <div className="relative h-64 w-full bg-gray-50">
                                {currentPlayer.photoUrl ? (
                                    <img alt={currentPlayer.name} className="w-full h-full object-contain object-bottom" src={currentPlayer.photoUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <span className="material-icons-round text-6xl text-gray-300">person</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90"></div>
                                
                                {/* Status Overlays */}
                                {playerSold && (
                                    <div className="absolute inset-0 z-20 bg-green-900/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="bg-white px-6 py-2 rounded-2xl shadow-xl transform rotate-6 border-4 border-green-500">
                                            <div className="text-green-600 font-display font-bold text-4xl tracking-tighter uppercase">SOLD</div>
                                        </div>
                                    </div>
                                )}
                                {unSold && (
                                    <div className="absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="bg-white px-6 py-2 rounded-2xl shadow-xl transform -rotate-6 border-4 border-gray-400">
                                            <div className="text-gray-500 font-display font-bold text-4xl tracking-tighter uppercase">UNSOLD</div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-4 left-5 right-5">
                                    <div className="flex gap-2 mb-3">
                                        {currentPlayer.role && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wide border border-blue-100">
                                                <span className="material-icons-round text-sm">sports_cricket</span> {currentPlayer.role}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="font-display font-bold text-5xl text-gray-900 leading-[0.85] tracking-tighter drop-shadow-sm uppercase">
                                        {currentPlayer.name.split(' ').map((part, i) => (
                                            <React.Fragment key={i}>
                                                {i === 1 ? <><br/><span className="text-gray-300">{part}</span></> : part}
                                            </React.Fragment>
                                        ))}
                                    </h2>
                                </div>
                            </div>
                            <div className="px-5 pb-6 pt-2">
                                <div className="grid grid-cols-4 gap-2 mb-6 border-b border-gray-100 pb-6">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mat</p>
                                        <p className="font-display font-bold text-2xl text-gray-900">{currentPlayer.stats?.matches || '-'}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Runs</p>
                                        <p className="font-display font-bold text-2xl text-gray-900">{currentPlayer.stats?.runs || '-'}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">SR</p>
                                        <p className="font-display font-bold text-2xl text-gray-900">{currentPlayer.stats?.sr || '-'}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Wkts</p>
                                        <p className="font-display font-bold text-2xl text-gray-900">{currentPlayer.stats?.wickets || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Price</span>
                                    <span className="font-display font-bold text-2xl text-gray-900">{formatPoints(currentPlayer.basePrice || 4000)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Team Purses Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <span className="material-icons-round text-[#FF4500] text-xl">account_balance_wallet</span>
                                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-gray-900">Team Purses</h3>
                            </div>
                            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 snap-x">
                                {purseData.map((team, idx) => {
                                    const theme = getTeamTheme(team.name);
                                    return (
                                        <div key={idx} className="snap-center shrink-0 w-64 bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                {theme.logo ? (
                                                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-gray-100 flex items-center justify-center p-0.5 shrink-0 shadow-inner">
                                                        <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.color} flex items-center justify-center font-display font-bold text-xl shadow-inner`}>{theme.char}</div>
                                                )}
                                                <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{team.name}</span>
                                            </div>
                                            <span className="font-display font-bold text-xl text-gray-900">{formatPoints(team.remainingPurse)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Top Bids Section */}
                        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-round text-green-500 text-xl">trending_up</span>
                                    <h3 className="font-display font-bold text-xl uppercase tracking-wide text-gray-900">Top 5 Bids</h3>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                <span>Player</span>
                                <span>Bid</span>
                            </div>
                            <div className="space-y-3">
                                {topBids.length > 0 ? topBids.slice(0, 5).map((bid, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700">{bid.player}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">{bid.team || '-'}</span>
                                        </div>
                                        <span className="font-display font-bold text-lg text-gray-900">{formatPoints(bid.amount)}</span>
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-400 text-xs py-2">No bids yet</div>
                                )}
                            </div>
                        </section>

                        {/* Unsold Players Section */}
                        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-icons-round text-gray-400 text-xl">gavel</span>
                                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-gray-900">Unsold Players</h3>
                            </div>
                            <div className="space-y-3">
                                {unsoldPlayers.length > 0 ? unsoldPlayers.map((player, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="text-sm font-semibold text-gray-700">{player.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">{player.role}</span>
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-400 text-xs py-2">No unsold players</div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-2 flex justify-around items-center z-40 pb-7 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center gap-1 text-primary"
                >
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-0.5">
                        <span className="material-icons-round text-2xl">sensors</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                </button>
                <button 
                    onClick={() => router.push('/players')}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all"
                >
                    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-0.5">
                        <span className="material-icons-round text-2xl">person_search</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Pool</span>
                </button>
                <button 
                    onClick={() => router.push('/squad')}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all"
                >
                    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-0.5">
                        <span className="material-icons-round text-2xl">diversity_3</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Squads</span>
                </button>
            </nav>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

const MobilePreAuctionLobby = ({ teams, getTeamTheme, formatPoints }) => {
    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-xl shadow-orange-500/5 border border-orange-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-[#FF4500] to-orange-300"></div>
                <div className="absolute -top-24 -right-24 size-48 bg-orange-100/50 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 size-48 bg-blue-100/50 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary mb-6 border border-orange-100">
                        <span className="material-icons-round text-sm animate-spin-slow">hourglass_empty</span>
                        Auction Starting Soon
                    </div>
                    <h1 className="font-display font-black text-5xl text-gray-900 tracking-tighter leading-[0.85] uppercase mb-4">
                        KCC <br/> SEASON 5
                    </h1>
                                        <p className="text-gray-500 text-xs font-medium max-w-[280px] leading-relaxed">
                                        Franchises are getting ready for the battle. Stay tuned as we build the dream teams.
                                    </p>
                                    
                                    <button 
                                        onClick={() => router.push('/players')}
                                        className="mt-4 w-full bg-white border border-slate-200 hover:border-primary/50 text-slate-700 font-black py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-xs active:scale-95"
                                    >
                                        <span>View Players Pool</span>
                                        <span className="material-symbols-outlined font-black text-primary text-lg">groups</span>
                                    </button>
                </div>
            </div>

            {/* Teams Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="font-display font-bold text-xl text-gray-900 flex items-center gap-3">
                        <span className="material-icons-round text-primary">diversity_3</span>
                        Franchises
                    </h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{teams.length} Teams</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {teams.map((team, idx) => {
                        const theme = getTeamTheme(team.name);
                        return (
                            <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-transform duration-200">
                                <div className="flex items-center gap-4">
                                    {theme.logo ? (
                                        <div className="size-14 rounded-2xl bg-white overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center p-1">
                                            <img src={theme.logo} alt={team.name} className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-white/10 ${theme.bg} ${theme.color}`}>
                                            {theme.char || team.name[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-display font-bold text-lg text-gray-900 leading-tight mb-1">{team.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner: [Placeholder]</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-1">Purse</p>
                                    <p className="font-display font-bold text-gray-900 border-b border-orange-100">{formatPoints(team.remainingPurse)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileAuctionUI;
