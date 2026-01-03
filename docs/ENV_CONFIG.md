# Environment Configuration Guide for KCC Auction 2026

## Configuration Variables

### NEXT_PUBLIC_MOCK_MODE
- **Purpose**: Switch between mock (testing) and real (production) mode
- **Values**: `true` or `false`
- **Default**: `false`

### NEXT_PUBLIC_TOURNAMENT_YEAR
- **Purpose**: Select which tournament year to use in real mode
- **Values**: `2026`, `2025`, or any year
- **Default**: `2026`
- **Note**: Only applies to real mode. Mock mode always uses standard collections.

## Configuration Examples

### Mock Mode (Testing)
```env
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_TOURNAMENT_YEAR=2026
```
**Collections used**: `mock_players`, `mock_teams`  
**Purse**: ₹2,00,000

### Real Mode - 2026 Tournament
```env
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_TOURNAMENT_YEAR=2026
```
**Collections used**: `players_2026`, `teams_2026`  
**Purse**: ₹1,00,000

### Real Mode - Previous Tournament
```env
NEXT_PUBLIC_MOCK_MODE=false
# Omit TOURNAMENT_YEAR or set to old year
```
**Collections used**: `players`, `teams`  
**Purse**: ₹1,00,000

## How It Works

### Mock Mode
- Always uses standard mock collections (`mock_players`, `mock_teams`)
- No year suffix needed
- Perfect for testing without affecting production data
- Higher purse (₹2L) for testing scenarios

### Real Mode
- Uses year-based collections based on `TOURNAMENT_YEAR`
- `2026` → `players_2026`, `teams_2026`
- Other years → `players`, `teams` (fallback)
- Production purse (₹1L)

## Seeding Data

### Seed Mock Data (for testing)
```bash
node scripts/seed2026.js --reset --mock
```
Seeds to: `mock_players`, `mock_teams`

### Seed Real 2026 Data
```bash
node scripts/seed2026.js --reset
```
Seeds to: `players_2026`, `teams_2026`

## Quick Setup

1. Copy your `.env.local` file
2. Add these two variables:
   ```env
   NEXT_PUBLIC_MOCK_MODE=false
   NEXT_PUBLIC_TOURNAMENT_YEAR=2026
   ```
3. Restart your dev server
4. The app will now use 2026 collections!
