# 2026 Tournament Seeding Guide

## Overview

This guide explains how to seed the database with 2026 tournament data using player information from Excel and team data from JSON.

## Prerequisites

- Excel file: `KCC Tournament Season #5 (Responses).xlsx` (in project root)
- Team data: `scripts/teams_2026.json` (template provided)
- MongoDB connection configured in `.env.local`

## Step 1: Prepare Team Data

Edit `scripts/teams_2026.json` with your team information:

```json
[
  {
    "name": "Team Name",
    "motto": "Team Motto or Quote",
    "logoUrl": "/logos/teamlogo.jpg",
    "owner": "Owner Name",
    "purseLeft": 100000,
    "squad": []
  }
]
```

**Fields:**
- `name` (required): Team name
- `motto` (optional): Team motto or tagline
- `logoUrl` (required): Path to team logo (place logos in `/public/logos/`)
- `owner` (required): Team owner name
- `purseLeft` (optional): Starting purse, defaults to 100,000
- `squad` (optional): Leave as empty array, will be populated during auction

## Step 2: Prepare Excel File

Ensure your Excel file has these columns:
- **Player Name** - Player's full name
- **Player Photo** - Google Drive link (will be converted to local path)
- **Player Age** - Player's age
- **Players Dominant Batting Hand** - "Right" or "Left"
- **Players Dominant Bowling Hand** - e.g., "Right arm fast", "Left arm spin"
- **Role** - "AllRounder", "Batsmen", "Bowler", or "Wicketkeeper"
- **Which is your favorite team?** - Player's favorite team

**Note:** The script will auto-generate photo URLs from player names. You'll need to:
1. Download photos from Google Drive links
2. Rename them to match generated URLs (e.g., `johndoe.jpg`)
3. Place them in `/public/players/` directory

## Step 3: Test with Dry Run

Before seeding, test that your data is valid:

**For Real Mode (production 2026 data):**
```bash
node scripts/seed2026.js --dry-run
```

**For Mock Mode (testing 2026 data):**
```bash
node scripts/seed2026.js --dry-run --mock
```

This will:
- Parse the Excel file
- Parse the teams JSON
- Validate all data
- Show summary statistics
- **NOT** write to database

Add `--verbose` for detailed output:

```bash
node scripts/seed2026.js --dry-run --verbose
node scripts/seed2026.js --dry-run --mock --verbose
```

## Step 4: Seed the Database

Once dry run succeeds, seed the database:

**For Real Mode (creates `players_2026` and `teams_2026` collections):**
```bash
node scripts/seed2026.js --reset
```

**For Mock Mode (creates `mock_players_2026` and `mock_teams_2026` collections):**
```bash
node scripts/seed2026.js --reset --mock
```

**Flags:**
- `--reset` - Clear existing 2026 data before seeding
- `--mock` - Seed mock collections instead of real collections
- `--verbose` - Show detailed logging
- `--dry-run` - Validate without writing to database

**Collections Created:**
- Real mode: `players_2026`, `teams_2026` (purse: ₹1,00,000)
- Mock mode: `mock_players_2026`, `mock_teams_2026` (purse: ₹2,00,000)

**Warning:** `--reset` will delete existing 2026 data in the selected mode. Old tournament data in other collections remains untouched.


## Step 5: Download Player Photos

After seeding:

1. Open the Excel file
2. For each player, download their photo from the Google Drive link
3. Rename the photo to match the generated URL:
   - Player name: "John Doe" → Photo: `johndoe.jpg`
   - Player name: "Tanmay Shah" → Photo: `tanmayshah.jpg`
4. Place all photos in `/public/players/` directory

**Tip:** The script will show warnings about Google Drive links and the generated URLs during seeding.

## Step 6: Verify

1. Check MongoDB to verify data:
   ```bash
   # Using MongoDB shell or Compass
   use kcc_auction
   db.teams.find()
   db.players.find().limit(5)
   ```

2. Start the application:
   ```bash
   npm run dev
   ```

3. Navigate to the players page and verify:
   - All players are displayed
   - Photos are loading correctly
   - Team information is correct

## Troubleshooting

### Excel Parsing Errors

If you get errors about missing columns:
- Check that column names in Excel exactly match the expected names
- Ensure there are no extra spaces in column headers
- Verify the Excel file is not corrupted

### Role/Hand Normalization

The script automatically normalizes:
- **Roles:** "all-rounder" → "AllRounder", "batsman" → "Batsmen"
- **Batting Hand:** "right hand" → "Right", "left handed" → "Left"
- **Bowling Hand:** "right arm fast" → "Right-arm Fast"

If you see warnings about unknown values, check the Excel data.

### Database Connection

If seeding fails with connection error:
- Verify `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running
- Check network connectivity

### Missing Photos

If photos don't load:
- Check file names match generated URLs (lowercase, no spaces)
- Verify photos are in `/public/players/` directory
- Check browser console for 404 errors

## Data Structure

### Player Schema
```javascript
{
  name: String,
  role: String, // AllRounder, Batsmen, Bowler, Wicketkeeper
  photoUrl: String,
  battingHand: String, // Right, Left
  bowlingHand: String, // Right-arm Fast, Right-arm Spin, Left-arm Fast, Left-arm Spin
  favTeam: String,
  basePrice: Number, // Default: 4000
  stats: {
    matches: Number,
    runs: Number,
    wickets: Number,
    avg: Number,
    sr: Number
  },
  unSold: Boolean,
  isSold: Boolean,
  soldTo: ObjectId,
  soldFor: Number
}
```

### Team Schema
```javascript
{
  name: String,
  logoUrl: String,
  motto: String,
  owner: String,
  purseLeft: Number,
  squad: [ObjectId]
}
```

## Script Output Example

```
🌱 KCC Tournament 2026 - Database Seeding Script
==================================================

📄 Reading Excel file: /path/to/excel.xlsx
✅ Found 47 rows in Excel file
✅ Successfully parsed 47 players

📄 Reading teams JSON: /path/to/teams_2026.json
✅ Successfully parsed 6 teams

📊 Data Summary:
   Teams: 6
   Players: 47

🔌 Connecting to MongoDB...
✅ Connected to database

🗑️  Clearing existing data...
✅ Existing data cleared

📥 Inserting teams...
✅ Inserted 6 teams

📥 Inserting players...
✅ Inserted 47 players

==================================================
🎉 Seeding completed successfully!
==================================================
   Teams created: 6
   Players created: 47

💡 Next steps:
   1. Verify data in MongoDB
   2. Download player photos from Google Drive
   3. Place photos in /public/players/ directory
   4. Start the application and verify
```
