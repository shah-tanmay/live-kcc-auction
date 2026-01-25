
'use client';

import { useState } from 'react';
import RevealSuspense from '@/components/reveal/RevealSuspense';
import RevealResult from '@/components/reveal/RevealResult';

export default function RevealClient({ team, ownerPhotos }) {
  const [isRevealed, setIsRevealed] = useState(team.isRevealed);
  const [teamData, setTeamData] = useState(team);

  const handleRevealSuccess = (updatedTeam) => {
    setTeamData(updatedTeam);
    setIsRevealed(true);
  };

  if (isRevealed) {
    return <RevealResult team={teamData} ownerPhotos={ownerPhotos} />;
  }

  return (
    <RevealSuspense 
      team={teamData} 
      ownerPhotos={ownerPhotos} 
      onRevealSuccess={handleRevealSuccess} 
    />
  );
}
