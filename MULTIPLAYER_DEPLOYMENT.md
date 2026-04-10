# Multiplayer Feature - Deployment & Testing Guide

## Quick Start

### 1. Firebase Setup (5 minutes)

1. Go to https://console.firebase.google.com
2. Create a new project or use existing one
3. In Project Settings, find your config:
   ```
   apiKey: "xxx"
   authDomain: "xxx.firebaseapp.com"
   databaseURL: "https://xxx.firebaseio.com"
   projectId: "xxx"
   storageBucket: "xxx.appspot.com"
   messagingSenderId: "xxx"
   appId: "xxx"
   ```
4. Go to "Realtime Database" tab
5. Click "Create Database" → Start in Test Mode → Enable

### 2. Environment Variables

Add to Vercel project (Settings → Environment Variables):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Test in Development

```bash
# Set env vars in .env.local (copy from Firebase)
npm run dev

# Test at http://localhost:3000/multiplayer
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add multiplayer feature"
git push origin main

# Vercel auto-deploys, add env vars in Vercel UI
```

## Testing Checklist

### Feature Tests

#### Session Management
- [ ] Create new session works
- [ ] Session ID displays and is copyable
- [ ] Join session with ID works
- [ ] Redirect to session after create/join works
- [ ] Leave session works and redirects
- [ ] End session works (host only)
- [ ] Sessions auto-clean after 24 hours

#### Player Synchronization
- [ ] Player list updates in real-time (test in 2 tabs)
- [ ] Player names display correctly
- [ ] Host badge shows only for creator
- [ ] "You" badge shows current player
- [ ] Join time displays correctly
- [ ] Removing a player updates list for others

#### Image Selection
- [ ] Image categories load
- [ ] Clicking category shows images
- [ ] Can select/deselect images
- [ ] Selection syncs to Firebase
- [ ] Other players see selections in real-time
- [ ] Selection count increments correctly
- [ ] Image metadata loads (mood, climate, etc.)

#### Preference Selection
- [ ] Budget buttons work (low/medium/high/luxury)
- [ ] Destination input updates
- [ ] Date range picker opens and works
- [ ] Interest badges toggle on/off
- [ ] Changes sync across players in real-time
- [ ] Tabs switch between Images and Details

#### Ready Status
- [ ] Click "Mark as Ready" toggles state
- [ ] Ready status shows in player list (checkmark)
- [ ] Progress bar shows ready count
- [ ] "Analyze Together" button appears when all ready
- [ ] Progress indicator updates in real-time

#### Analysis & Results
- [ ] All players ready → Analyze button enabled
- [ ] Click Analyze sends request to API
- [ ] Results display with 3 destinations
- [ ] Each destination shows:
  - [ ] Name, match percentage, climate
  - [ ] Activities, food highlights
  - [ ] Hotels information
- [ ] Summary text explains why these destinations
- [ ] Results appear for all players simultaneously
- [ ] Share button works (test copy to clipboard)
- [ ] New Analysis button resets session

#### Session Info
- [ ] Session ID displays correctly
- [ ] Copy button works and shows "Copied!"
- [ ] Role shows "Host" or "Participant"
- [ ] Leave button works
- [ ] End Session button visible for host only
- [ ] Tip message displays

#### Navigation
- [ ] Back button from results works
- [ ] Browser back button doesn't break session
- [ ] Refreshing page keeps you in same session
- [ ] Wrong session ID shows error
- [ ] Expired session shows error

### Multi-Device Testing

#### Test with 2 Players

1. **Setup:**
   - Player 1: Open `/multiplayer` in browser 1
   - Player 1: Create session, copy ID
   - Player 2: Open `/multiplayer` in browser 2
   - Player 2: Join session with ID

2. **Image Selection:**
   - Player 1: Select 5 images from Nature category
   - Player 2: Should see images appear in real-time
   - Player 2: Select 3 different images from Beaches
   - Player 1: Should see Beaches images highlighted

3. **Preferences:**
   - Player 1: Set Budget to "Premium"
   - Player 2: Set interests to "Adventure", "Food"
   - Both: Should see changes in form

4. **Ready Status:**
   - Player 1: Click "Mark as Ready"
   - Player 2: See Player 1 marked ready with checkmark
   - Player 2: Progress shows "1/2 ready"
   - Player 2: "Analyze Together" button NOT visible yet
   - Player 2: Click "Mark as Ready"
   - Both: Progress shows "2/2 ready"
   - Both: "Analyze Together" button NOW visible
   - Host (Player 1): Click "Analyze Together"
   - Both: See results appear on screen

5. **Results:**
   - Both: See same 3 destination recommendations
   - Both: Can see match percentages
   - Both: Summary explanation matches player count

### Browser Testing

Test these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS & iOS)
- [ ] Edge (latest)
- [ ] Mobile Chrome

### Performance Testing

1. **Latency:**
   - Update preference in Player 1
   - Measure time until Player 2 sees it
   - Target: < 500ms
   - Method: Watch timestamps or use console

2. **Load Testing:**
   - Open 5 browser tabs
   - Join same session with different names
   - All should sync correctly
   - No lag or crashes

3. **Database:**
   - Check Firebase console for data structure
   - Should show sessions/{sessionId} with correct data
   - No orphaned data after session ends

## Common Issues & Solutions

### Session Not Found
**Problem:** "Session not found" error
**Solution:**
1. Verify session ID spelling
2. Check if session creator left (auto-ends)
3. Check Firebase Database has data
4. Clear browser cache and retry

### No Real-time Updates
**Problem:** Changes don't sync across players
**Solution:**
1. Check Firebase env vars are correct
2. Open Firebase Console → Database → See live data
3. Check browser console for Firebase errors
4. Verify player is in same session ID
5. Try hard refresh (Ctrl+Shift+R)

### Images Not Loading
**Problem:** Image placeholders show no images
**Solution:**
1. Check `/api/generate-images` works
2. Verify image generation API keys
3. Check browser Network tab for failed requests
4. Check console for errors
5. Retry category

### Analysis Button Disabled
**Problem:** "Analyze Together" grayed out even though all ready
**Solution:**
1. Check all players see checkmarks (ready status)
2. Refresh page if UI out of sync
3. Click Mark as Ready again
4. Check browser console for errors

### Slow Performance
**Problem:** Real-time updates lag
**Solution:**
1. Check internet connection speed
2. Close other Firebase projects
3. Reduce number of simultaneous sessions
4. Check browser console for errors
5. Check Firebase console usage

## Database Inspection

### View Session Data in Firebase Console

1. Go to Firebase Console → Project → Database
2. Click on "sessions"
3. Should see structure like:

```
sessions/
  ├── abc123def456
  │   ├── sessionId: "abc123def456"
  │   ├── createdAt: 1704067200000
  │   ├── host: { userId: "user_x", username: "Alice" }
  │   ├── players:
  │   │   ├── user_x: { userId: "user_x", username: "Alice", isReady: true, ... }
  │   │   └── user_y: { userId: "user_y", username: "Bob", isReady: false, ... }
  │   ├── preferences:
  │   │   ├── budget: "high"
  │   │   ├── interests: ["adventure", "culture"]
  │   │   └── selectedImages: [...]
  │   └── analysisResults: null (or results after analysis)
```

### Debug Real-time Listeners

Add this to browser console to see real-time updates:

```javascript
// In any page with MultiplayerProvider active
const context = window.__multiplayerContext; // May vary
console.log('Session data:', context?.session);
console.log('Players:', context?.players);
```

## Monitoring & Analytics

### Track Usage

1. Add to `/app/multiplayer/page.tsx`:
```typescript
import { trackEvent } from '@/lib/analytics';

// In create session handler
trackEvent('multiplayer_session_created', { sessionId });

// In join handler
trackEvent('multiplayer_session_joined', { sessionId });
```

2. Track in Firebase Realtime Database:
- Monitor `/sessions` node size
- Count active sessions
- Track analysis requests

### Key Metrics

- Active sessions per day
- Average players per session
- Analysis requests per session
- Average session duration
- Common destinations recommended

## Production Checklist

- [ ] Firebase Realtime Database enabled
- [ ] All env vars set in Vercel
- [ ] Test multi-device flow (2+ players)
- [ ] Test with slow network (DevTools)
- [ ] Test with different browsers
- [ ] Error handling works (wrong ID, expired, etc.)
- [ ] Analytics/logging in place
- [ ] Documentation updated
- [ ] User guide created
- [ ] Support contact info visible

## Rollback Plan

If issues occur:

1. **Disable Multiplayer:**
   - Remove `/multiplayer` route
   - Remove `MultiplayerProvider` from layout
   - Redeploy

2. **Revert to Previous Version:**
   - `git revert <commit>`
   - Deploy

3. **Maintain Firebase Data:**
   - Export database from Firebase Console
   - Store backup
   - Don't delete if reverting code

## Support & Documentation

### User Guide Location
- Add link on main site
- Include in `/multiplayer` page
- Email to beta testers

### Suggested User Guide Topics
- How to create a session
- How to join a friend's session
- How to select images
- How to set preferences
- What happens at analysis
- How to share results

### Support Channels
- Email support: support@example.com
- Discord: #multiplayer-help
- Docs: /docs/multiplayer

## Future Improvements

### Phase 2
- [ ] User accounts & authentication
- [ ] Session history
- [ ] Preference presets
- [ ] Mobile app

### Phase 3
- [ ] Video chat integration
- [ ] Chat/comments
- [ ] Group voting system
- [ ] Destination comparison tool

### Phase 4
- [ ] Cross-platform sync
- [ ] Offline mode
- [ ] Advanced analytics
- [ ] API for 3rd party apps
