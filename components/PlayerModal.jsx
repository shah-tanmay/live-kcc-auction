'use client';
import React from 'react';
import { formatPoints } from '@/utils/formatPoints';

export default function PlayerModal({ player, isOpen, onClose }) {
    if (!isOpen || !player) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
            
            {/* Modal */}
            <div 
                className="relative z-10 w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all m-4 flex flex-col md:flex-row h-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100/50 backdrop-blur-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left Side - Player Image */}
                <div className="relative w-full md:w-2/5 bg-slate-100 flex items-end justify-center overflow-hidden h-64 md:h-auto min-h-[300px] p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
                    <span className="absolute top-8 left-4 font-display font-black text-8xl text-slate-200/50 -rotate-90 origin-top-left select-none z-0">
                        {player.name.split(' ').pop().toUpperCase()}
                    </span>
                    
                    {player.photoUrl ? (
                        <img 
                            alt={player.name}
                            className="h-auto max-h-full w-auto max-w-full object-contain object-bottom relative z-10 drop-shadow-2xl" 
                            src={player.photoUrl}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300 text-9xl font-black">
                            {player.name[0]}
                        </div>
                    )}
                    
                    {/* Mobile Header Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden"></div>
                    <div className="absolute bottom-4 left-4 z-20 md:hidden text-white">
                        <h2 className="text-3xl font-display font-bold">{player.name}</h2>
                        <p className="text-sm font-medium opacity-90">{player.role}</p>
                    </div>
                </div>

                {/* Right Side - Player Details */}
                <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col overflow-y-auto bg-white custom-scrollbar">
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="bg-primary/10 text-primary text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    {player.role}
                                </span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 border border-green-100">
                                    <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[0.65rem] font-bold text-green-700 uppercase tracking-wide">
                                        {player.isSold ? 'SOLD' : player.unSold ? 'UNSOLD' : 'AVAILABLE'}
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-4xl font-display font-black text-slate-900">{player.name}</h2>
                        </div>
                        {player.favTeam && (
                            <div className="flex flex-col items-end">
                                <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Favorite Team</span>
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span className="font-bold text-slate-800 text-sm">{player.favTeam}</span>
                                    <span className="material-symbols-outlined text-red-500 text-lg">favorite</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center hover:bg-slate-100 transition-colors">
                            <div className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1">Matches</div>
                            <div className="font-display font-black text-2xl text-slate-800">{player.stats?.matches || 0}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center hover:bg-slate-100 transition-colors">
                            <div className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1">Runs</div>
                            <div className="font-display font-black text-2xl text-slate-800">{player.stats?.runs || 0}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center hover:bg-slate-100 transition-colors">
                            <div className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1">Wickets</div>
                            <div className="font-display font-black text-2xl text-slate-800">{player.stats?.wickets || 0}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center hover:bg-slate-100 transition-colors">
                            <div className="text-[0.65rem] uppercase font-bold text-slate-400 mb-1">Average</div>
                            <div className="font-display font-black text-2xl text-slate-800">{player.stats?.avg || 0}</div>
                        </div>
                    </div>

                    {player.lastYearSoldPrice > 0 && (
                        <div className="mb-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-amber-600 text-lg">history</span>
                                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">KCC SEASON 4 (Purse: 1L)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-white rounded-xl border border-amber-100 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-slate-400">groups</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Sold To</p>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{player.lastYearSoldTeam}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Price</p>
                                    <p className="font-black text-primary text-lg tracking-tighter">{formatPoints(player.lastYearSoldPrice)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-slate-100 w-full mb-8"></div>

                    {/* Batting & Bowling Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">sports_cricket</span> Batting Style
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 font-medium">Hand</span>
                                    <span className="font-bold text-slate-800">{player.battingHand || 'Right'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Strike Rate</span>
                                    <span className="font-bold text-slate-800">{player.stats?.sr || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">sports_baseball</span> Bowling Style
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 font-medium">Style</span>
                                    <span className="font-bold text-slate-800">{player.bowlingHand || 'Right-arm Fast'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="text-xs text-slate-400 font-medium text-center">
                            Registered for KCC Season 5 Auction
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
