/**
 * Centralized team theme configuration for the KCC Auction.
 * Provides colors, initials, and logo paths for all known teams.
 */

export const getTeamTheme = (teamName, logoUrl = null) => {
    if (!teamName) return { color: 'text-slate-600', bg: 'bg-slate-100', char: '?', logo: null };
    
    // Normalize string for matching
    const name = teamName.toLowerCase();

    // 0. Use provided logo from DB if available
    if (logoUrl) {
        // We still match name for colors/char if needed, but logo takes precedence
        // Determining colors based on name logic helper
        let theme = { color: 'text-slate-800', bg: 'bg-white', char: teamName.substring(0, 2).toUpperCase() };
        
        // Try to find specific theme for colors
        if (name.includes('royal')) theme = { color: 'text-white', bg: 'bg-blue-900', char: 'RR' };
        if (name.includes('titan')) theme = { color: 'text-slate-900', bg: 'bg-teal-100', char: 'T' };
        if (name.includes('striker')) theme = { color: 'text-white', bg: 'bg-purple-700', char: 'S' };
        
        return { ...theme, logo: logoUrl };
    }
    
    // 1. Primary KCC Match (with logos) - 2026 Teams
    if (name.includes('raval')) return { logo: '/logos/ravalroyals.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'RR' };
    if (name.includes('siddha')) return { logo: '/logos/siddha.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'SS' };
    if (name.includes('house of')) return { logo: '/logos/houseofvr.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'VR' };
    if (name.includes('oswal')) return { logo: '/logos/oswalavengers.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'OA' };
    if (name.includes('samrat')) return { logo: '/logos/samrattitans.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'ST' };
    if (name.includes('aj') || name.includes('turf')) return { logo: '/logos/ajturf.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'AT' };
    if (name.includes('boundary')) {
        const initials = name.includes('basher') ? 'BB' : 'BS';
        return { logo: '/logos/boundarysmashers.jpeg', color: 'text-slate-800', bg: 'bg-white', char: initials };
    }
    if (name.includes('dunakhe')) return { logo: '/logos/dunakhedynamos.jpeg', color: 'text-slate-800', bg: 'bg-white', char: 'DD' };

    // Previous matches kept for compatibility or reference
    if (name.includes('champion')) return { logo: '/logos/champion.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'CH' };
    if (name.includes('kcc')) return { logo: '/logos/kcc.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'KC' };
    if (name.includes('kumar')) return { logo: '/logos/kumar.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'KM' };
    // oswal handled above
    if (name.includes('solanki')) return { logo: '/logos/solanki.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'SL' };
    if (name.includes('upadhyay')) return { logo: '/logos/upadhyay.jpg', color: 'text-slate-800', bg: 'bg-white', char: 'UP' };
    
    // 2. Legacy/Mock Matching (IPL Colors)
    if (name.includes('mumbai')) return { color: 'text-white', bg: 'bg-blue-900', char: 'MI', logo: null };
    if (name.includes('chennai')) return { color: 'text-white', bg: 'bg-yellow-500', char: 'CSK', logo: null };
    if (name.includes('royal')) return { color: 'text-white', bg: 'bg-red-700', char: 'RCB', logo: null };
    if (name.includes('kolkata')) return { color: 'text-white', bg: 'bg-purple-800', char: 'KKR', logo: null };
    if (name.includes('rajasthan')) return { color: 'text-white', bg: 'bg-pink-600', char: 'RR', logo: null };
    if (name.includes('sunrisers')) return { color: 'text-white', bg: 'bg-orange-500', char: 'SRH', logo: null };
    if (name.includes('delhi')) return { color: 'text-white', bg: 'bg-blue-600', char: 'DC', logo: null };
    if (name.includes('punjab')) return { color: 'text-white', bg: 'bg-red-500', char: 'PBKS', logo: null };
    if (name.includes('lucknow')) return { color: 'text-white', bg: 'bg-cyan-600', char: 'LSG', logo: null };
    if (name.includes('gujarat')) return { color: 'text-white', bg: 'bg-teal-700', char: 'GT', logo: null };
    if (name.includes('firehawks')) return { color: 'text-orange-600', bg: 'bg-orange-100', char: 'F', logo: null };

    // Fallback initials/color
    const initials = teamName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    return { 
        color: 'text-slate-600', 
        bg: 'bg-slate-100', 
        char: initials || '?', 
        logo: null 
    };
};
