
'use client';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function RevealResult({ team, ownerPhotos }) {
   useEffect(() => {
       const duration = 3000;
       const animationEnd = Date.now() + duration;
       const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
       
       const random = (min, max) => Math.random() * (max - min) + min;

       const interval = setInterval(() => {
           const timeLeft = animationEnd - Date.now();
           if (timeLeft <= 0) return clearInterval(interval);
           
           const particleCount = 50 * (timeLeft / duration);
           confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
           confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
       }, 250);
       
       return () => clearInterval(interval);
   }, []);

   const price = team.ownerValuation ? team.ownerValuation.toLocaleString() : "0";

   return (
    <>
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
    `}</style>
    <style jsx>{`

        .price-glow {
            text-shadow: 0 0 30px rgba(255, 107, 0, 0.6), 0 0 60px rgba(255, 107, 0, 0.3);
        }
        .orange-gradient {
            background: linear-gradient(135deg, #FF6B00 0%, #FF9E5E 100%);
        }
        .confetti-piece {
            position: absolute;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 0.125rem;
        }
        /* Primary Colors for this page specifically as per HTML */
        .text-primary-custom { color: #FF6B00; }
        .bg-primary-custom { background-color: #FF6B00; }
    `}</style>
    
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#FFF9F5] text-[#2D1B10] transition-colors duration-300 overflow-x-hidden font-[Lexend]">
        {/* Background Confetti Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-100">
             <div className="confetti-piece orange-gradient top-10 left-[10%] rotate-12"></div>
             <div className="confetti-piece bg-[#FF8533] top-20 left-[25%] -rotate-12"></div>
             <div className="confetti-piece bg-[#FF6B00] top-40 left-[80%] rotate-45"></div>
             <div className="confetti-piece orange-gradient top-60 left-[5%] -rotate-[30deg]"></div>
             <div className="confetti-piece bg-[#CC5500] top-[80%] left-[15%] rotate-12"></div>
             <div className="confetti-piece bg-[#FF6B00] top-[70%] left-[85%] -rotate-12"></div>
             <div className="confetti-piece orange-gradient top-[30%] left-[90%] rotate-45"></div>
             <div className="confetti-piece bg-[#FF8533] top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-10"></div>
        </div>

        <div className="layout-container flex h-full grow flex-col relative z-10">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-orange-100 px-6 md:px-10 py-3 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="size-8">
                         <img src="/kcc_logo.jpg" alt="KCC" referrerPolicy="no-referrer" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">KCC Season 5</h2>
                </div>
                
                {/* Desktop Nav - Hidden on very small screens if needed, but keeping for now */}
                <div className="hidden md:flex flex-1 justify-end gap-8">
                     <div className="flex items-center gap-9">
                        <a href="/admin/dashboard" className="text-sm font-medium leading-normal hover:text-[#FF6B00] transition-colors">Dashboard</a>
                        <span className="text-sm font-medium leading-normal hover:text-[#FF6B00] transition-colors opacity-50 cursor-not-allowed">Auction Board</span>
                     </div>
                     <div className="flex gap-2">
                        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-orange-50 text-[#FF6B00] px-2.5">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                     </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="max-w-[800px] w-full flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-orange-500/10 border-2 border-[#FF6B00]/30 flex items-center justify-center p-4">
                            <img src={team.logoUrl} referrerPolicy="no-referrer" alt="Team Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center">
                            <p className="uppercase tracking-[0.3em] text-[10px] font-black text-[#FF6B00]/70">City Premier League 2026</p>
                            <h4 className="text-xl font-black italic tracking-tighter text-gray-800">{team.name}</h4>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-[-12px] rounded-full orange-gradient opacity-40 blur-md animate-pulse"></div>
                            <div className="absolute inset-[-4px] rounded-full bg-[#FF6B00]"></div>
                            
                            <div className="rounded-full h-44 w-44 border-4 border-white relative z-10 shadow-2xl overflow-hidden bg-white flex">
                                {(() => {
                                    const photoPlaceholder = "https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Photo";
                                    const dispPhotos = ownerPhotos && ownerPhotos.length > 0 ? ownerPhotos : [photoPlaceholder];
                                    return dispPhotos.map((url, idx, arr) => (
                                        <div key={idx} className={`h-full ${arr.length > 1 ? 'w-1/2' : 'w-full'} border-r border-slate-100 last:border-0 relative`}>
                                            <img src={url} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt="Owner" />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center mt-2">
                             <h3 className="text-3xl font-black leading-tight tracking-tight text-center">{team.owner}</h3>
                             <p className="text-[#FF6B00] font-bold tracking-widest text-xs uppercase bg-orange-50 px-4 py-1 rounded-full mt-1">Team Owner{ownerPhotos?.length > 1 ? 's' : ''}</p>
                             
                             {ownerPhotos?.length > 1 && (
                                 <div className="mt-4 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                     {team.owner.split(/,|&/).map((name, idx) => {
                                         const cleanName = name.trim();
                                         const individualPrice = (team.ownerValuations && team.ownerValuations[cleanName]) || (team.ownerValuation / (team.owner.split(/,|&/).length));
                                         if (!cleanName) return null;
                                         return (
                                             <div key={idx} className="bg-white/60 backdrop-blur-sm border border-orange-100 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[140px] shadow-sm hover:shadow-md transition-all border-b-4 border-b-orange-200">
                                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[160px] mb-1">{cleanName}</span>
                                                 <span className="text-xl font-black text-slate-800 tracking-tighter">₹{individualPrice.toLocaleString()}</span>
                                             </div>
                                         )
                                     })}
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full relative animate-in fade-in zoom-in duration-700">
                         {/* Decor elements */}
                        <span className="material-symbols-outlined absolute -left-12 top-0 text-[#FF6B00] opacity-40 text-4xl hidden sm:block">celebration</span>
                        <span className="material-symbols-outlined absolute -right-12 bottom-0 text-[#FF6B00] opacity-40 text-4xl hidden sm:block">auto_awesome</span>

                        <div className="flex h-9 items-center justify-center gap-x-2 rounded-full orange-gradient px-8 shadow-lg shadow-orange-500/40">
                            <span className="material-symbols-outlined text-white text-lg font-bold">verified</span>
                            <p className="text-white text-[11px] font-black leading-none tracking-[0.2em]">REVEALED</p>
                        </div>

                        <div className="flex flex-col items-center mt-6">
                            <h1 className="text-gray-400 tracking-[0.4em] text-xs font-black uppercase">Owner's Base Price</h1>
                            <div className="flex items-center gap-1">
                                <span className="text-[#FF6B00] text-3xl md:text-5xl font-black mt-4 md:mt-8">₹</span>
                                <span className="text-[#FF6B00] text-[80px] md:text-[140px] font-black leading-none tracking-tighter price-glow">
                                    {price}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 pt-6">
                        <a className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF6B00] transition-colors" href="/squad">
                            <span className="material-symbols-outlined text-lg">dashboard</span>
                            <span className="underline underline-offset-4">View Squad</span>
                        </a>
                    </div>
                </div>
            </main>
            
            {/* Bottom Glow Effect */}
            <div className="fixed bottom-0 left-0 w-full h-96 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/20 blur-[120px]"></div>
                <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/20 blur-[120px]"></div>
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-24 items-end opacity-20">
                    <span className="material-symbols-outlined text-[120px] text-[#FF6B00]">hotel_class</span>
                    <span className="material-symbols-outlined text-[180px] text-[#FF6B00]">stars</span>
                    <span className="material-symbols-outlined text-[120px] text-[#FF6B00]">hotel_class</span>
                </div>
            </div>
        </div>
    </div>
    </>
   );
}
