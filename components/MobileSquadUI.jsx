'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const MobileSquadUI = ({ 
    teams, 
    selectedTeam, 
    setSelectedTeam, 
    formatPoints, 
    getTeamTheme 
}) => {
    const router = useRouter();

    if (!selectedTeam) return null;

    const currentTeamTheme = getTeamTheme(selectedTeam.name);
    const amountSpent = (selectedTeam.squad || []).reduce((acc, player) => acc + (player.soldFor || 0), 0);
    const remainingPurse = selectedTeam.purseLeft ?? 0;

    return (
        <div className="bg-[#F8F9FB] min-h-screen pb-24 font-body">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3" onClick={() => router.push('/')}>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-0.5">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-display font-black text-xl leading-none text-gray-900 tracking-tighter uppercase">KCC SEASON 5</h1>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Squad Center</span>
                    </div>
                </div>
            </header>

            {/* Team Selector (Horizontal Scroll) */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto hide-scrollbar sticky top-[61px] z-40">
                <div className="flex gap-4 min-w-max">
                    {teams.map((team) => {
                        const isSelected = selectedTeam?._id === team._id;
                        const theme = getTeamTheme(team.name);
                        return (
                            <button
                                key={team._id}
                                onClick={() => setSelectedTeam(team)}
                                className={`flex flex-col items-center gap-1 transition-all ${isSelected ? 'scale-105' : 'opacity-60 grayscale hover:opacity-100'}`}
                            >
                                <div className={`size-12 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border-2 ${isSelected ? 'border-[#F24E1E]' : 'border-transparent'}`}>
                                    {theme.logo ? (
                                        <img src={theme.logo} alt={team.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <div className={`w-full h-full ${theme.bg} ${theme.color} flex items-center justify-center font-bold`}>
                                            {theme.char}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-[#F24E1E]' : 'text-slate-500'}`}>
                                    {team.name.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="p-4 space-y-6">
                {/* Team Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-5">
                        {currentTeamTheme.logo ? (
                            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 p-2 text-white">
                                <img src={currentTeamTheme.logo} alt={selectedTeam.name} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className={`size-16 rounded-2xl flex items-center justify-center shadow-md ${currentTeamTheme.bg} ${currentTeamTheme.color} font-black text-2xl`}>
                                {currentTeamTheme.char}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{selectedTeam.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="material-icons-round text-sm text-slate-400">person</span>
                                <span className="text-xs text-slate-500 font-medium">Owner: John Doe</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Spent</p>
                            <p className="text-lg font-bold text-slate-900">{formatPoints(amountSpent)}</p>
                        </div>
                        <div className="bg-[#F24E1E] rounded-xl p-3 text-white shadow-lg shadow-orange-500/20">
                            <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1">Remaining</p>
                            <p className="text-lg font-bold">{formatPoints(remainingPurse)}</p>
                        </div>
                    </div>
                </div>

                {/* Squad List Section Title */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="font-bold text-slate-900">Squad List ({selectedTeam.squad?.length || 0})</h2>
                </div>

                {/* Squad Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {(selectedTeam.squad || []).map((player, idx) => (
                        <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <div className="h-32 bg-gradient-to-b from-slate-200 to-slate-50 relative flex items-end justify-center">
                                {player.photoUrl ? (
                                    <img 
                                        alt={player.name} 
                                        className="h-28 object-contain drop-shadow-md" 
                                        src={player.photoUrl} 
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <span className="material-icons-round text-4xl text-slate-300">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 relative">
                                <div className="absolute -top-6 left-2 right-2 bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{player.role || 'Player'}</p>
                                    <h3 className="font-bold text-slate-900 text-xs leading-tight truncate">{player.name}</h3>
                                </div>
                                <div className="mt-7 bg-slate-50 rounded-lg p-2 flex flex-col border border-gray-100">
                                    <p className="text-[8px] text-slate-400 font-bold uppercase">Sold At</p>
                                    <p className="text-sm font-extrabold text-[#F24E1E]">{formatPoints(player.soldFor)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!selectedTeam.squad || selectedTeam.squad.length === 0) && (
                        <div className="col-span-2 py-10 text-center text-slate-400">
                            No players in this squad yet.
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-2 flex justify-around items-center z-50 pb-7 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all"
                >
                    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-0.5">
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
                <button className="flex flex-col items-center gap-1 text-primary">
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-0.5">
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

export default MobileSquadUI;
