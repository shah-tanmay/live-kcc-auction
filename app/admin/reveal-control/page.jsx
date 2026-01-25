'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPoints } from '@/utils/formatPoints';

export default function RevealControl() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTeams = async () => {
    const res = await fetch('/api/teams');
    const data = await res.json();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleReset = async (teamId) => {
      if(!confirm('Are you sure you want to UNDO this reveal? The owner(s) will be removed from the squad and their "Sold" status will be reset.')) return;
      
      try {
          const res = await fetch('/api/reveal/reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ teamId })
          });
          if (res.ok) {
              alert('Reveal successfully reset and owners returned to auction pool.');
              fetchTeams();
          } else {
              alert('Failed to reset');
          }
      } catch (e) {
          alert('Error resetting reveal');
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-[Lexend] text-slate-400">Loading Control Panel...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-[Lexend] text-slate-900 flex flex-col antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
      `}</style>
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-orange-100 bg-white px-6 md:px-10 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <span className="material-icons-round text-slate-400">arrow_back</span>
            </button>
            <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Reveal Manager</h1>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none mt-1">Auction Protocol Control</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
                <span className="material-icons-round text-orange-500 text-sm">info</span>
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Manage Team Valuations & Reveals</span>
             </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teams.map(team => (
                    <div key={team._id} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col relative group overflow-hidden">
                        {/* Status Ribbon */}
                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${team.isRevealed ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                            {team.isRevealed ? 'Revealed' : 'Hidden'}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 p-2 shadow-inner">
                                <img src={team.logoUrl} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-lg font-black text-slate-900 truncate leading-tight">{team.name}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{team.owner}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 mb-8">
                            <div className="flex justify-between items-end p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Valuation</span>
                                <span className="text-lg font-black text-slate-800">{formatPoints(team.ownerValuation)}</span>
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => window.open(`/reveal/${team.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, '_blank')}
                                className="bg-white border-2 border-slate-100 hover:border-blue-500/20 hover:bg-blue-50 text-slate-500 hover:text-blue-600 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="material-icons-round text-lg group-hover/btn:scale-110 transition-transform">visibility</span>
                                <span>Preview</span>
                            </button>
                            {team.isRevealed && (
                                <button 
                                    onClick={() => handleReset(team._id)} 
                                    className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-50 hover:border-red-600 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn2"
                                >
                                    <span className="material-icons-round text-lg group-hover/btn2:rotate-90 transition-transform">undo</span>
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">KCC Auction Security Protocol Level 4</p>
      </footer>
    </div>
  );
}
