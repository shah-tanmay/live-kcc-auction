
import connectToDB from '@/lib/db';
import Team2026 from '@/lib/models/team2026';
import Player2026 from '@/lib/models/player2026';
import RevealClient from './RevealClient';

export default async function RevealPage({ params }) {
  const { id } = await params;
  await connectToDB();

  let teamDoc = null;
  
  // 1. Try finding by ID if it matches ObjectId format
  // We use a simple regex check for 24 hex chars
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
      try {
        teamDoc = await Team2026.findById(id).lean();
      } catch (e) { }
  }

  // 2. If not found by ID, try finding by name/slug
  if (!teamDoc) {
      try {
          let adjustedId = id;
          // Alias check: if the user asks for boundary-smashers, we still want to show Boundary Bashers
          if (id.toLowerCase() === 'boundary-smashers') {
              adjustedId = 'boundary-bashers';
          }

          // Convert "raval-royals" -> "Raval Royals" logic
          // Split by hyphens or underscores
          const slugParts = adjustedId.split(/[-_]/).filter(p => p.length > 0);
          
          if (slugParts.length > 0) {
              // Create a regex that allows any non-word character (space, dot, etc) between parts
              // e.g. "house-of-v-r" -> "house", "of", "v", "r"
              // Matches "House of V.R" because "." is a non-word char
              const regexPattern = slugParts.map(p => 
                  p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars in the part
              ).join('[\\s\\W]*'); 
              
              // Use regex to find the team
              // We use ^ and partial match logic or strict? 
              // Let's try to match the start of the name at least, or just contains.
              // For "raval-royals", we want to match "Raval Royals".
              teamDoc = await Team2026.findOne({
                  name: { $regex: new RegExp(`^${regexPattern}`, 'i') }
              }).lean();
          }
      } catch (e) {
          console.error("Error looking up team by slug:", e);
      }
  }

  if (!teamDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-2xl font-bold">Team not found</h1>
        <p className="text-slate-400 mt-2">Checking for: {id}</p>
      </div>
    );
  }

  // Find owner player for photo
  const ownerNames = teamDoc.owner ? teamDoc.owner.split(/,|&/).map(s => s.trim()).filter(s => s) : [];
  let ownerPhotos = [];
  
  if (ownerNames.length > 0) {
      for (const name of ownerNames) {
          // Try exact match or close match
          const p = await Player2026.findOne({ 
              name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
          }).select('photoUrl').lean();
          
          if (p && p.photoUrl) {
              ownerPhotos.push(p.photoUrl);
          }
      }
  }

  const team = JSON.parse(JSON.stringify(teamDoc));

  return <RevealClient team={team} ownerPhotos={ownerPhotos} />;
}
