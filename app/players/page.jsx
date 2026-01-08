'use client';
import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import DesktopPlayersUI from '@/components/DesktopPlayersUI';
import MobilePlayersUI from '@/components/MobilePlayersUI';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/players', { cache: 'no-store' });
            const data = await res.json();
            setPlayers(data);
        } catch (error) {
            console.error("Failed to fetch players", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();

        // Implement Firebase listener for real-time status updates
        const statusRef = ref(db, 'auction/status');
        const unsubscribe = onValue(statusRef, async (snapshot) => {
            const status = snapshot.val();
            // Re-fetch if a player is sold, unsold, or the auction state is reset
            if (status?.type === 'SOLD' || status?.type === 'UNSOLD' || !status?.type) {
                await fetchPlayers();
            }
        });

        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            unsubscribe();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (loading) return <LoadingScreen message="Loading Auction Pool..." />;

    if (isMobile) {
        return <MobilePlayersUI players={players} refreshData={fetchPlayers} />;
    }

    return <DesktopPlayersUI players={players} />;
}
