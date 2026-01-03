'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPoints } from '@/utils/formatPoints';
import PlayerModal from '@/components/PlayerModal';

export default function DesktopPlayersUI({ players }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player);
        setModalOpen(true);
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || p.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const roles = ['All', 'Batsmen', 'Bowler', 'AllRounder', 'Wicketkeeper'];

    return (
        <div className="min-h-screen bg-slate-50 font-display flex flex-col">
            {/* Header / Nav */}
            <header className="flex-none bg-white border-b border-slate-200 px-10 py-5 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <div className="size-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <img src="/kcc_logo.jpg" alt="KCC" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">KCC Season 5</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Official Auction Pool</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input 
                            type="text" 
                            placeholder="Search by player name..." 
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-80 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => router.push('/')}
                        className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">home</span>
                        <span>Back to Auction</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-hidden flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-6">
                    {[
                        { label: 'Total Pool', value: players.length, icon: 'groups' },
                        { label: 'Sold', value: players.filter(p => p.isSold).length, icon: 'gavel', color: 'text-green-600' },
                        { label: 'Unsold', value: players.filter(p => p.unSold).length, icon: 'cancel', color: 'text-red-500' },
                        { label: 'Remaining', value: players.filter(p => !p.isSold && !p.unSold).length, icon: 'hourglass_empty', color: 'text-primary' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className={`size-14 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color || 'text-slate-600'}`}>
                                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter & Table Area */}
                <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                    <div className="flex-none p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex gap-2">
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                        selectedRole === role 
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredPlayers.length} Players</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Player</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hand Skills</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fav Team</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Auction Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers.map((player) => (
                                    <tr 
                                        key={player._id} 
                                        onClick={() => handlePlayerClick(player)}
                                        className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 cursor-pointer"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                                    {player.photoUrl ? (
                                                        <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xl shadow-inner uppercase tracking-tighter">
                                                            {player.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-base leading-tight mb-1">{player.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {player._id.toString().slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-tight group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {player.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-bold text-slate-700">Bat: <span className="text-slate-500 font-medium">{player.battingHand}</span></p>
                                                <p className="text-xs font-bold text-slate-700">Bowl: <span className="text-slate-500 font-medium">{player.bowlingHand}</span></p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-sm">favorite</span>
                                                <span className="text-xs font-bold text-slate-600">{player.favTeam || 'None'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">{formatPoints(player.basePrice)}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {player.isSold ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-tight border border-green-200 shadow-sm">SOLD</span>
                                                    <div className="mt-1 flex flex-col items-end">
                                                        <p className="text-[10px] font-black text-slate-900">{player.soldTo?.name || 'Unknown Team'}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{formatPoints(player.soldFor)}</p>
                                                    </div>
                                                </div>
                                            ) : player.unSold ? (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-tight border border-slate-200">UNSOLD</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-tight border border-blue-100 animate-pulse">AVAILABLE</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredPlayers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                                <span className="material-symbols-outlined text-6xl mb-4">person_search</span>
                                <p className="font-bold text-xl uppercase tracking-[0.2em]">No Players Match Criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="flex-none py-5 px-10 border-t border-slate-200 bg-white">
                <div className="flex items-center justify-between opacity-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">KCC Season 5 • Player Registry</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Updated {new Date().toLocaleDateString()}</p>
                </div>
            </footer>

            {/* Player Modal */}
            <PlayerModal 
                player={selectedPlayer}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}
