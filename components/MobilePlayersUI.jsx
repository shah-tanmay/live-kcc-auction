'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPoints } from '@/utils/formatPoints';
import PlayerModal from '@/components/PlayerModal';

export default function MobilePlayersUI({ players, refreshData }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player);
        setModalOpen(true);
    };

    const roles = ['All', 'Batsmen', 'Bowler', 'AllRounder', 'Wicketkeeper'];

    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || p.role === selectedRole;
        const matchesStatus = selectedStatus === 'All' || 
            (selectedStatus === 'Sold' && p.isSold) || 
            (selectedStatus === 'Unsold' && p.unSold) || 
            (selectedStatus === 'Available' && !p.isSold && !p.unSold);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const statuses = ['All', 'Available', 'Sold', 'Unsold'];

    const getRoleGradient = (role) => {
        switch (role) {
            case 'Batsmen': return 'from-[#EAD8B1] to-[#FFF8E8]';
            case 'Bowler': return 'from-[#C4E0E5] to-[#E6F7FA]';
            case 'AllRounder': return 'from-[#D1E6D3] to-[#F0FFF4]';
            case 'Wicketkeeper': return 'from-[#E6D4C4] to-[#FDF6F0]';
            default: return 'from-slate-200 to-slate-50';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-display pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3" onClick={() => router.push('/')}>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-0.5">
                        <img src="/kcc_logo.jpg" alt="KCC Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-display font-black text-xl leading-none text-gray-900 tracking-tighter uppercase">KCC SEASON 5</h1>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Players Pool</span>
                    </div>
                </div>
            </header>

            <div className="bg-white px-4 py-3 border-b border-gray-100 flex flex-col gap-3 sticky top-[65px] z-40 shadow-sm">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center mr-1">Role:</span>
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                                selectedRole === role 
                                ? 'bg-primary border-primary text-white shadow-md shadow-orange-500/20' 
                                : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center mr-1">Status:</span>
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                                selectedStatus === status 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20' 
                                : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Overlay/Input */}
            <div className="p-4">
                <div className="relative group">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Search for players..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPlayers.map((player) => (
                    <div 
                        key={player._id} 
                        onClick={() => handlePlayerClick(player)}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-pointer active:scale-95 transition-transform isolation-auto"
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <div className={`h-44 bg-gradient-to-b ${getRoleGradient(player.role)} relative flex items-end justify-center pt-8`}>
                            {player.isSold ? (
                                <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md z-10 uppercase tracking-tighter border border-green-400">
                                    Sold
                                </span>
                            ) : player.unSold ? (
                                <span className="absolute top-3 left-3 bg-gray-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md z-10 uppercase tracking-tighter border border-gray-400">
                                    Unsold
                                </span>
                            ) : (
                                <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md z-10 uppercase tracking-tighter border border-blue-400 animate-pulse">
                                    Available
                                </span>
                            )}
                            
                            {player.photoUrl ? (
                                <img 
                                    key={player._id}
                                    src={player.photoUrl} 
                                    alt={player.name} 
                                    referrerPolicy="no-referrer" 
                                    className="h-40 object-contain drop-shadow-2xl filter contrast-125 transition-transform group-hover:scale-110 duration-500" 
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <div className="h-40 w-full flex items-center justify-center relative">
                                    <div className="size-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border-2 border-white/50 shadow-xl">
                                        <span className="text-4xl font-black text-gray-700/80 drop-shadow-sm">{player.name[0]}</span>
                                    </div>
                                    <span className="material-icons-round absolute text-[120px] text-gray-900/5 -bottom-4 translate-y-0 select-none pointer-events-none font-black italic uppercase">
                                        {player.role.slice(0,3)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-3 relative z-20">
                            <div className="absolute -top-10 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-50 flex flex-col min-w-0 z-30">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{player.role}</p>
                                <h3 className="font-extrabold text-gray-900 text-sm leading-tight truncate">{player.name}</h3>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-2 mb-4 px-1">
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">Base Price</p>
                                    <p className="text-xs font-black text-gray-900">{formatPoints(player.basePrice)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">Fav Team</p>
                                    <p className="text-xs font-black text-gray-700 truncate">{player.favTeam || '-'}</p>
                                </div>
                            </div>

                            {player.lastYearSoldPrice > 0 && (
                                <div className="mx-1 mb-4 bg-amber-50/50 rounded-xl p-2.5 border border-amber-100/50">
                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">KCC SEASON 4 (Purse: 1L)</p>
                                    <p className="text-[10px] font-bold text-slate-700 leading-tight">
                                        Sold for <span className="text-primary font-black">{formatPoints(player.lastYearSoldPrice)}</span> to <span className="text-slate-900 font-black uppercase text-[9px]">{player.lastYearSoldTeam}</span>
                                    </p>
                                </div>
                            )}



                            {player.isSold && (
                                <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 bg-white rounded-lg p-1 border border-green-100 flex items-center justify-center">
                                            {player.soldTo?.logoUrl ? (
                                                <img src={player.soldTo.logoUrl} className="w-full h-full object-contain" alt="" />
                                            ) : (
                                               <span className="material-icons-round text-green-500 text-sm">groups</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-green-600 uppercase">Sold To</p>
                                            <p className="text-[11px] font-black text-gray-900 leading-tight">{player.soldTo?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-green-600 uppercase">Price</p>
                                        <p className="text-xs font-black text-gray-900">{formatPoints(player.soldFor)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPlayers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                    <span className="material-icons-round text-6xl text-gray-200 mb-4 font-light">person_off</span>
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No Players Found</h3>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
            )}

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
                    className="flex flex-col items-center gap-1 text-primary"
                >
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-0.5">
                        <span className="material-icons-round text-2xl">person_search</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Players</span>
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

            {/* Player Modal */}
            <PlayerModal 
                player={selectedPlayer}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />

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
}
