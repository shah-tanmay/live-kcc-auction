'use client';
import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ message = "Loading Auction Data..." }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + (Math.random() * 10) : prev));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex h-screen w-full flex-col bg-[#f8f6f5] font-display overflow-hidden text-[#181311] transition-colors duration-300">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#f2460d]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-[40%] -left-[10%] w-[30%] h-[30%] bg-[#f2460d]/5 rounded-full blur-2xl"></div>
            </div>

            {/* Main Content Container */}
            <div className="flex h-full grow flex-col z-10">
                <div className="flex flex-1 justify-center items-center py-5 px-4 md:px-40">
                    <div className="flex flex-col max-w-[480px] w-full flex-1 items-center justify-center">
                        {/* Logo Section */}
                        <div className="mb-8 relative group">
                            <div className="absolute inset-0 bg-[#f2460d]/20 blur-xl rounded-full scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg flex items-center justify-center p-4 border border-white/50">
                                <div className="w-full h-full bg-center bg-contain bg-no-repeat" style={{ backgroundImage: 'url("/kcc_logo.jpg")' }}></div>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="text-[#181311] tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-2">
                            KCC Season 5
                        </h1>
                        <p className="text-[#8a6b60] text-sm font-medium mb-12 text-center">
                            Official Auction Dashboard
                        </p>

                        {/* Progress Section */}
                        <div className="w-full flex flex-col gap-3 p-4 bg-white/50 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
                            <div className="flex gap-6 justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#f2460d] animate-spin text-xl">sync</span>
                                    <p className="text-[#181311] text-base font-semibold leading-normal">{message}</p>
                                </div>
                                <span className="text-[#f2460d] font-bold text-sm">{Math.round(progress)}%</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="rounded-full bg-[#e6dedb] overflow-hidden">
                                <div 
                                    className="h-2.5 rounded-full bg-[#f2460d] shadow-[0_0_10px_rgba(242,70,13,0.4)] transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[#8a6b60] text-xs font-normal leading-normal text-center pt-1">
                                Connecting to secure auction server...
                            </p>
                            
                            {/* Auction History Fact */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                    <span className="material-symbols-outlined text-[#f2460d] text-xl">history_edu</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#f2460d] uppercase tracking-wider">KCC Legacy Fact</span>
                                    <p className="text-xs font-medium text-[#181311] leading-snug">
                                        The highest bid in KCC history was placed in Season 4 for <span className="font-bold text-[#f2460d]">Parth Raval</span> at <span className="font-bold text-[#f2460d]">41,000</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="pb-8 w-full flex justify-center">
                    <p className="text-[#8a6b60] text-xs font-normal leading-normal px-4 text-center opacity-60">
                        Application v1.0.2 © 2024
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
