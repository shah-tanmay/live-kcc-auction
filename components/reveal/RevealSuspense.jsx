
'use client';

import { useState, useEffect } from 'react';

// Force light mode
import { ThemeProvider, createTheme } from '@mui/material/styles';
const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function RevealSuspense({ team, ownerPhotos, onRevealSuccess }) {
  // Ensure we are always in light mode visually for this component
  // We will strip all 'dark:' classes in the subsequent steps
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Normalize photos
  const photoPlaceholder = "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Photo";
  const photos = ownerPhotos && ownerPhotos.length > 0 ? ownerPhotos : [photoPlaceholder];
  const hasMultipleOwners = photos.length > 1;

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team._id, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error revealing price');
        setLoading(false);
      } else {
        onRevealSuccess(data.team);
      }
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          handleSubmit();
      }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
      `}</style>
      <style jsx>{`
        .glass-morphism {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(249, 115, 22, 0.1);
        }
        .orange-glow {
            box-shadow: 0 0 40px -10px rgba(249, 115, 22, 0.15);
        }
        .shimmer {
            background: linear-gradient(90deg, rgba(249, 115, 22, 0) 0%, rgba(249, 115, 22, 0.05) 50%, rgba(249, 115, 22, 0) 100%);
            background-size: 200% 100%;
            animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .ios-bg-glow {
            background: radial-gradient(circle at top, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0) 70%);
        }
        
        /* Shared Colors */
        .text-primary-custom { color: #F97316; }
        .bg-primary-custom { background-color: #F97316; }
        .border-primary-custom { border-color: #F97316; }
      `}</style>
      
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex relative min-h-screen w-full flex-col overflow-x-hidden antialiased font-[Lexend] bg-[#FDFCFB] text-[#0F172A] transition-colors duration-300">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-custom opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="flex h-full grow flex-col relative z-10 w-full">
          <div className="px-4 md:px-10 flex justify-center w-full">
            <div className="flex flex-col max-w-[1200px] flex-1 w-full">
              <header className="flex items-center justify-between whitespace-nowrap px-4 py-6 w-full">
                <div className="flex items-center gap-3">
                  <div className="size-8">
                     <img src="/kcc_logo.jpg" alt="KCC" referrerPolicy="no-referrer" className="w-full h-full object-contain rounded-full shadow-sm" />
                  </div>
                  <h2 className="text-xl font-black leading-tight tracking-tight uppercase italic text-slate-800">KCC Season 5</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase hidden sm:block">Official Portal</span>
                </div>
              </header>
            </div>
          </div>
          
          <main className="flex flex-1 flex-col items-center justify-center py-8 px-4 w-full">
            <div className="max-w-[480px] w-full flex flex-col items-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-custom opacity-20 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative w-36 h-36 md:w-44 md:h-44 bg-white rounded-full shadow-2xl flex items-center justify-center p-6 border-4 border-orange-500/10">
                    <img src={team.logoUrl} referrerPolicy="no-referrer" className="w-full h-full object-contain" alt="Team Logo" />
                </div>
              </div>
              
              <div className="w-full">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white shadow-2xl shadow-orange-500/5 overflow-hidden border border-slate-100 orange-glow">
                  <div className="w-full h-72 bg-slate-100 overflow-hidden flex">
                      {photos.map((url, idx) => (
                          <div key={idx} className={`h-full ${hasMultipleOwners ? 'w-1/2' : 'w-full'} border-r border-white/20 last:border-0 relative group/img`}>
                             <img src={url} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={team.owner} />
                          </div>
                      ))}
                  </div>
                  <div className="flex w-full flex-col items-center justify-center gap-1.5 py-8 px-6 bg-gradient-to-b from-white to-orange-50/30">
                    <p className="text-primary-custom text-[10px] font-extrabold uppercase tracking-[0.3em]">Owner Profile</p>
                    <h3 className="text-slate-900 text-3xl font-black leading-tight tracking-tight text-center">{team.owner}</h3>
                    <p className="text-slate-500 text-sm font-semibold tracking-wide">{team.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex flex-col items-center gap-8">
                <div className="relative w-full h-36 rounded-2xl glass-morphism overflow-hidden flex items-center justify-center border-2 border-dashed border-orange-500/20 group">
                  <div className="absolute inset-0 shimmer"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-primary-custom text-6xl mb-2 drop-shadow-sm">lock</span>
                    <p className="text-primary-custom text-xs font-black tracking-[0.5em] uppercase">Private Valuation</p>
                  </div>
                </div>
                
                <div className="text-center px-4 space-y-2">
                  <h1 className="text-slate-900 tracking-tight text-2xl font-black uppercase">Identity Verified</h1>
                  <p className="text-slate-500 text-sm font-medium max-w-[320px] mx-auto">Please enter your secure access key to reveal the final auction valuation for this owner.</p>
                </div>
                
                <div className="w-full flex flex-col gap-4">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">lock_person</span>
                    <input 
                        className="w-full bg-white border-slate-200 rounded-xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none text-center tracking-[1em] font-black text-lg placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300 text-slate-800" 
                        placeholder="••••••••" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center font-bold animate-pulse">{error}</p>}
                  
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="w-full bg-primary-custom hover:bg-orange-600 text-white font-black py-5 rounded-xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? (
                        <span className="animate-spin material-symbols-outlined">refresh</span>
                    ) : (
                        <>
                            <span className="tracking-[0.2em] uppercase text-sm">Reveal Price</span>
                            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">key_visualizer</span>
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
          
          <footer className="py-12 flex flex-col items-center gap-4">
             <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
             <div className="flex items-center gap-2.5 text-slate-400">
               <span className="material-symbols-outlined text-lg">verified</span>
               <span className="text-[10px] font-bold tracking-[0.25em] uppercase">KCC Auction Hub Secure Protocol</span>
             </div>
          </footer>
        </div>
      </div>


      {/* MOBILE VIEW */}
      <div className="flex md:hidden min-h-screen w-full flex-col font-[Inter] bg-[#FDFCFB] text-slate-900 ios-bg-glow antialiased transition-colors duration-300">
        <div className="h-12 w-full"></div>
        <header className="px-6 flex justify-between items-center h-14 z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 bg-white p-0.5 overflow-hidden">
                    <img src="/kcc_logo.jpg" alt="KCC" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                </div>
                <span className="font-[Montserrat] font-extrabold text-sm tracking-tighter uppercase italic text-slate-800">KCC SEASON 5</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Official Portal</span>
            </div>
        </header>

        <main className="flex-1 px-6 pb-12 ios-bg-glow flex flex-col items-center w-full">
            <div className="mt-8 mb-6 relative">
                <div className="absolute inset-0 bg-primary-custom opacity-10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-[#E8E2D5] rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <div className="text-center p-2 flex items-center justify-center w-full h-full">
                         <img src={team.logoUrl} referrerPolicy="no-referrer" className="w-16 h-16 object-contain" alt="Team Identity" />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl shadow-slate-200 overflow-hidden border border-white/50 mb-6">
                <div className="h-64 relative overflow-hidden bg-slate-100 flex">
                    {photos.map((url, idx) => (
                        <div key={idx} className={`h-full ${hasMultipleOwners ? 'w-1/2' : 'w-full'} border-r border-white/20 last:border-0 relative`}>
                           <img src={url} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale brightness-110" alt={team.owner} />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
                <div className="p-6 text-center">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary-custom uppercase mb-1">Owner Profile</p>
                    <h2 className="font-[Montserrat] font-extrabold text-2xl text-slate-900 mb-1">{team.owner}</h2>
                    <p className="text-sm font-medium text-slate-500">{team.name}</p>
                </div>
            </div>

            <div className="w-full max-w-sm mb-8">
                <div className="border-2 border-dashed border-orange-500/30 bg-orange-500/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-primary-custom rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
                        <span className="material-icons-round text-white text-2xl">lock</span>
                    </div>
                    <p className="text-[11px] font-[Montserrat] font-bold tracking-[0.4em] text-primary-custom uppercase">Private Valuation</p>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div className="text-center mb-6">
                    <h3 className="font-[Montserrat] font-bold text-lg text-slate-900 mb-2">IDENTITY VERIFIED</h3>
                    <p className="text-xs text-slate-400 leading-relaxed px-4">
                        Please enter your secure access key to reveal the final auction valuation for this owner.
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="material-icons-round text-xl">vpn_key</span>
                    </div>
                    <input 
                        className="w-full h-14 bg-white border border-slate-200 rounded-xl px-12 text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all" 
                        placeholder="••••••••" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm text-center font-bold animate-pulse">{error}</p>}

                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-14 bg-primary-custom hover:bg-orange-600 text-white font-[Montserrat] font-bold tracking-widest text-sm rounded-xl shadow-xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70">
                    {loading ? 'REVEALING...' : 'REVEAL PRICE'}
                    {!loading && <span className="material-icons-round text-xl">blur_on</span>}
                </button>
            </div>
            
            <footer className="mt-auto pt-10 pb-4">
                <div className="flex items-center gap-2 opacity-50 grayscale">
                    <span className="material-icons-round text-sm">verified_user</span>
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-600">KCC Auction Hub Secure Protocol</p>
                </div>
            </footer>
        </main>
        <div className="h-1.5 w-32 bg-slate-300 rounded-full mx-auto mb-2 opacity-30"></div>
      </div>
    </>
  );
}
