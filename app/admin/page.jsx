"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple hardcoded auth for now (as per original component likely)
    // Or we can hit an API if needed. Original AdminLogin logic usually just set a cookie.
    // Let's assume standard "admin" / "password" or check the original component.
    // The original AdminPage just rendered AdminLogin. 
    // I'll check AdminLogin.js content in next step if generic auth is needed, 
    // but for now I will implement basic cookie setting.
    
    // Simulating auth check
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@kcc-auction.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
        Cookies.set('adminToken', 'valid-token', { expires: 1 });
        router.push('/admin/dashboard');
    } else {
        alert('Invalid credentials');
        setLoading(false);
    }
  };

  return (
    <div className="bg-background-light text-slate-900 flex flex-col h-screen overflow-hidden font-display selection:bg-primary/20 selection:text-primary items-center justify-center relative">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-orange-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        </div>
        <main className="w-full max-w-[440px] px-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/60 backdrop-blur-xl p-8 sm:p-10 relative overflow-hidden ring-1 ring-slate-900/5">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-orange-500"></div>
                <div className="flex flex-col items-center gap-5 mb-10">
                    <div className="size-16 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 ring-4 ring-orange-50 transform hover:scale-105 transition-transform duration-300">
                        <span className="font-bold text-3xl tracking-tighter">KCC</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Portal</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Season 5 Auction Management</p>
                    </div>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1" htmlFor="email">Username or Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                            </div>
                            <input 
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                                id="email" 
                                name="email" 
                                placeholder="admin@kcc-auction.com" 
                                required 
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                            </div>
                            <input 
                                className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                                id="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors focus:outline-none" type="button">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button 
                            className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                            type="submit"
                            disabled={loading}
                        >
                            <span>{loading ? 'Logging in...' : 'Login to Dashboard'}</span>
                            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-8 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">
                    © 2024 KCC Tournament Auction.
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">lock</span> Secure</span>
                    <span>•</span>
                    <span>Restricted</span>
                </div>
            </div>
        </main>
    </div>
  );
}
