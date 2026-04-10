# Multiplayer Travel AI Planner - Setup & Integration Guide

## Overview
This guide explains how the multiplayer feature works and how to integrate it into your project.

## What's Included

### 1. Firebase Real-time Database
The multiplayer system uses Firebase to sync data across all players in real-time.

**Files:**
- `lib/firebase-config.ts` - Firebase initialization with environment variables
- `lib/firebase-utils.ts` - Core Firebase operations (create session, join, update, listen)

**Required Environment Variables:**
Add these to your Vercel project settings (Settings → Vars):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Multiplayer Context Provider
Real-time state management for all multiplayer sessions.

**File:**
- `contexts/multiplayer-context.tsx`

**Features:**
- Session creation and joining
- Player list management
- Preference syncing
- Ready status tracking
- Analysis results submission

**Already Integrated:**
The MultiplayerProvider is already added to `app/layout.tsx`, wrapping all pages.

### 3. Pages & Routing

#### `/app/multiplayer` - Lobby Page
Entry point for multiplayer mode. Users choose to create or join a session.

**Features:**
- Session creation with username
- Join existing session with session ID
- Copy-to-clipboard for session sharing
- Real-time redirect to active session

#### `/app/multiplayer/session/[sessionId]` - Active Session
Main collaborative workspace where players make selections together.

**Layout:**
- Left sidebar: Player list with ready status
- Center: Shared preferences form with image selection
- Right sidebar: Session info and controls

**Features:**
- Real-time player list updates
- Collaborative preference selection
- Image browsing and selection (synced across players)
- Ready status management
- Analysis trigger (host can analyze when all ready)
- Results display

### 4. Components

#### `ImageSelector` - Image Selection
Allows players to browse categories and select images they like.

**Features:**
- 10+ image categories (Nature, City, Beaches, Food, etc.)
- Lazy loading of images per category
- Multi-select with visual feedback
- Real-time sync to shared preferences

#### `SharedPreferencesForm` - Preferences & Details
Tabbed interface for selecting images and travel details.

**Tabs:**
1. **Images** - Browse and select images
2. **Details** - Set destination, budget, dates, interests

**Features:**
- Real-time preference syncing
- Ready/unready toggle button
- Form validation

#### `PlayerList` - Active Players
Shows all connected players with their status.

**Features:**
- Player avatars with initials
- Host badge for session creator
- Ready status indicator (checkmark or loading)
- Join time display

#### `SessionInfo` - Session Controls
Displays session details and control options.

**Features:**
- Session ID display with copy button
- Host/Participant role indicator
- Leave session button
- End session button (host only)
- Quick tips

#### `AnalysisResults` - Results Display
Shows destination recommendations based on collaborative preferences.

**Features:**
- Top 3 recommended destinations
- Match percentage for each
- Climate, activities, food highlights
- Summary explanation
- Share & new analysis buttons

### 5. API Routes

#### `POST /api/multiplayer/analyze`
Analyzes combined player preferences and returns destination recommendations.

**Request Body:**
```json
{
  "preferences": {
    "destination": "optional destination hint",
    "budget": "low|medium|high|luxury",
    "interests": ["adventure", "culture", "food"],
    "dateRange": { "start": "2024-01-01", "end": "2024-01-10" },
    "selectedImages": ["url1", "url2", ...]
  },
  "playerCount": 2
}
```

**Response:**
```json
{
  "requestSeed": "random_seed",
  "userProfile": {
    "dominantMood": "adventurous",
    "preferredClimate": "temperate",
    "preferredEnvironment": "mixed",
    "activityLevel": "high",
    "foodPreferences": ["international", "local"],
    "collaborative": true,
    "playerCount": 2
  },
  "countries": [
    {
      "name": "Japan",
      "code": "JP",
      "matchPercentage": 87,
      "climate": "temperate",
      "activities": ["hiking", "temples", "food"],
      "confidenceBreakdown": {...},
      "hotels": [...]
    }
  ],
  "summary": "Based on 2 travelers' collaborative preferences..."
}
```

## How It Works

### Creating a Multiplayer Session

1. User navigates to `/multiplayer`
2. Clicks "Create Session"
3. Enters their name
4. System generates unique session ID and returns to lobby
5. User sees session ID and can share it with friends
6. Clicking "Continue to Session" takes them to `/multiplayer/session/{sessionId}`

### Joining a Session

1. Friend receives session ID (via share or copy-paste)
2. Navigates to `/multiplayer`
3. Clicks "Join Session"
4. Enters name and session ID
5. Gets added to the session in real-time
6. Redirected to `/multiplayer/session/{sessionId}`

### Collaborative Selection Process

1. **Image Selection:**
   - Each player browses image categories
   - Selects images they like
   - Selections sync in real-time to Firebase
   - All players see each other's selections

2. **Preference Details:**
   - Players set shared destination (optional)
   - Select budget level
   - Choose travel dates
   - Add interests/tags
   - All changes sync immediately

3. **Ready Status:**
   - Each player marks themselves "Ready" when done
   - Host can trigger analysis when all players are ready
   - System shows "X/Y players ready" countdown

4. **Analysis:**
   - Host clicks "Analyze Together"
   - System sends merged preferences to `/api/multiplayer/analyze`
   - Receives destination recommendations
   - Results stored in Firebase and displayed to all players

5. **Results View:**
   - All players see the same results
   - Can share or start a new analysis

### Data Flow

```
User Input
    ↓
SharedPreferencesForm Component
    ↓
updatePreferences() → Firebase Database
    ↓
Real-time subscription updates all players
    ↓
AnalysisResults shown to all
```

### Real-time Sync

**Subscriptions Setup (in MultiplayerContext):**
```typescript
onSessionChange() → listens to entire session data
onPlayersChange() → listens to player list updates
onPreferencesChange() → listens to shared preferences
```

**Firebase Database Structure:**
```
sessions/
  {sessionId}/
    sessionId: string
    createdAt: timestamp
    status: "active" | "completed"
    host: { userId, username }
    players: { userId: {...} }
    preferences: { destination, budget, interests, ... }
    analysisResults: object | null
    lastModifiedBy: string
    expiresAt: timestamp
```

## Integration Steps

### 1. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database (set to start in test mode)
3. Copy your Firebase config
4. Add env vars to Vercel project:
   - Settings → Environment Variables
   - Paste all `NEXT_PUBLIC_FIREBASE_*` vars

### 2. Test Locally

```bash
# Set env vars in .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... (all other vars)

# Run dev server
npm run dev

# Test:
# 1. Open http://localhost:3000/multiplayer
# 2. Create a session
# 3. Open another browser tab/window
# 4. Join with session ID
# 5. Select images and preferences
# 6. See changes sync in real-time
```

### 3. Deploy to Vercel

1. Push code to GitHub
2. Vercel auto-deploys
3. Add env vars in Vercel project settings
4. Test at https://your-project.vercel.app/multiplayer

## Features Implemented

### Complete
- ✅ Session creation and joining
- ✅ Player list with real-time updates
- ✅ Image selection with category browsing
- ✅ Shared preference form with syncing
- ✅ Ready status tracking
- ✅ AI-powered destination analysis
- ✅ Results display with recommendations
- ✅ Session ID sharing with copy button
- ✅ Leave/End session functionality
- ✅ Real-time sync across all players

### Ready Status Flow
- Each player has a "Mark as Ready" button
- Host can see who's ready with progress bar
- "Analyze Together" button appears when all ready
- System shows waiting state with player indicators

### Error Handling
- Session not found → redirect to lobby
- Firebase connection error → shows error message
- API error → displays error with retry option
- Session expired → 24-hour auto-cleanup

## Troubleshooting

### Session Not Syncing
1. Check Firebase env vars in Vercel settings
2. Verify Firebase Database is enabled
3. Check browser console for Firebase errors
4. Ensure both players are on same session ID

### Images Not Loading
1. Check `/api/generate-images` is working
2. Verify image generation API keys
3. Check browser console for fetch errors
4. Try refreshing page

### Players Not Appearing
1. Verify player is actually in Firebase (check console logs)
2. Check session ID is correct
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check Firebase Database rules (should be test mode)

### Analysis Not Working
1. Verify players have selected preferences
2. Ensure all players clicked "Ready"
3. Check `/api/multiplayer/analyze` is working
4. Check browser console for API errors

## Future Enhancements

- Add player chat/comments
- Image filtering by tags
- Preference merge strategies (vote, consensus, etc.)
- Session history/bookmarks
- Group invite links
- Mobile optimization
- Video call integration
- Destination comparison tool

## Performance Notes

- Firebase Realtime Database: ~1000 concurrent sessions free tier
- Each session ~2KB data
- Real-time latency: 100-500ms typical
- No persistent storage - sessions auto-clean after 24 hours

## Security

- No authentication required (username-based)
- Session IDs are random 20-character strings
- Data expires after 24 hours
- No personal data stored
- Suitable for casual group planning

## Support

For issues, check:
1. Firebase console for database errors
2. Browser dev console for client errors
3. Vercel deployment logs
4. API route response in network tab
