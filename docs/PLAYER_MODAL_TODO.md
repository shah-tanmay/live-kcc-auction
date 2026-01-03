# Player Modal UI Integration - TODO

## Overview
Integrate player detail modals from the new HTML designs into the Next.js application.

## Design Files
- **Desktop Modal**: `player-pop-up.html`
- **Mobile Modal**: `player-pop-up-phone.html`

## Changes Required

### 1. Seeding Script ✅ DONE
- [x] Clean favorite team names (remove bracketed content like "(OWNER: NAME)")
- [x] Function `cleanFavTeam()` added to remove parentheses and content
- [x] Example: "AJ TURF TITANS (OWNER: AKSHAY JAIN)" → "AJ TURF TITANS"

### 2. Players Page - Remove Stats Display
**Files to Update**:
- `app/players/page.jsx` (desktop view)
- Mobile equivalent if separate

**Changes**:
- Remove stats grid (matches, runs, wickets, avg, sr) from player cards
- Keep only: name, role, photo, batting/bowling hand, favorite team
- Add click handler to open modal
- Stats will only be visible in the modal popup

### 3. Create Player Modal Component
**New Component**: `components/PlayerModal.jsx`

**Features**:
- Responsive design (desktop/mobile variants)
- Display full player stats
- Show player photo prominently
- Display batting/bowling details
- Show favorite team
- Remove CricHeroes profile link (not needed)
- Close button functionality

**Props**:
```javascript
{
  player: {
    name, role, photoUrl,
    battingHand, bowlingHand, favTeam,
    stats: { matches, runs, wickets, avg, sr }
  },
  isOpen: boolean,
  onClose: function
}
```

### 4. Update Player Cards
**Changes**:
- Make cards clickable
- Add `onClick` handler to open modal
- Simplify card content (remove stats grid)
- Keep: photo, name, role, batting/bowling style, fav team
- Add visual indicator that card is clickable (hover effects)

### 5. State Management
**Add to Players Page**:
```javascript
const [selectedPlayer, setSelectedPlayer] = useState(null);
const [modalOpen, setModalOpen] = useState(false);

const handlePlayerClick = (player) => {
  setSelectedPlayer(player);
  setModalOpen(true);
};
```

## Design Notes from HTML Files

### Desktop Modal (`player-pop-up.html`)
- Split layout: 40% image, 60% content
- Large player photo on left
- Stats in 4-column grid
- Batting/bowling details in 2-column layout
- Orange primary color (#f2460d)
- Close button top-right

### Mobile Modal (`player-pop-up-phone.html`)
- Full-screen overlay
- Large header image (400px height)
- Bottom sheet style with rounded top
- Stats in 4-column grid
- Swipe-down indicator
- Back button top-left

## Implementation Steps

1. **Extract Modal Component**
   - Convert HTML designs to React component
   - Use Tailwind classes from designs
   - Make responsive (show desktop/mobile variants)

2. **Update Player Cards**
   - Remove stats display
   - Add click handlers
   - Simplify layout

3. **Test**
   - Click player card → modal opens
   - Modal shows all stats
   - Close button works
   - Responsive on mobile/desktop
   - Favorite team names are clean (no brackets)

## Files to Create/Modify

### Create:
- `components/PlayerModal.jsx` - Main modal component
- `components/PlayerCard.jsx` - Simplified player card (optional refactor)

### Modify:
- `app/players/page.jsx` - Remove stats, add modal integration
- Mobile players page (if separate)

## Testing Checklist
- [ ] Favorite team names clean (no owner info in brackets)
- [ ] Player cards don't show stats
- [ ] Click player card → modal opens
- [ ] Modal shows full stats
- [ ] Modal responsive on desktop
- [ ] Modal responsive on mobile
- [ ] Close button works
- [ ] Background click closes modal
- [ ] ESC key closes modal
