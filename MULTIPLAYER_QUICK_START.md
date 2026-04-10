# Multiplayer Mode - Quick Start Reference

## 30-Second Setup

1. **Firebase Console:** Create project, enable Realtime Database (test mode)
2. **Copy Config:** Get API keys from Project Settings
3. **Vercel Vars:** Add `NEXT_PUBLIC_FIREBASE_*` env vars
4. **Deploy:** `git push origin main`
5. **Test:** Visit https://your-app.vercel.app/multiplayer

## User Quick Start

**Create Session:**
1. Go to `/multiplayer`
2. Click "Create Session"
3. Enter your name
4. Copy session ID and share

**Join Session:**
1. Get session ID from friend
2. Go to `/multiplayer`
3. Click "Join Session"
4. Enter name + session ID

**Play Together:**
1. Browse image categories
2. Select images you like
3. Set budget, dates, interests
4. All click "Mark as Ready"
5. Host clicks "Analyze Together"
6. See recommendations

## Code Quick Reference

### Import Multiplayer Context
```typescript
import { useMultiplayer } from '@/contexts/multiplayer-context'

function MyComponent() {
  const {
    sessionId,           // Current session ID
    userId,             // Your user ID
    username,           // Your name
    players,            // All players in session
    preferences,        // Shared preferences
    allPlayersReady,    // Boolean if all ready
    isHost,             // Boolean if you're host
    
    // Actions
    createNewSession,   // (username) => Promise
    joinExistingSession, // (sessionId, username) => Promise
    leaveCurrentSession, // () => Promise
    updatePreferences,  // (prefs) => Promise
    setReady,           // (isReady) => Promise
    submitAnalysis,     // (results) => Promise
  } = useMultiplayer()
}
```

### Firebase Utils
```typescript
import {
  createSession,        // (username) => Promise<{sessionId, userId}>
  joinSession,          // (sessionId, username) => Promise
  leaveSession,         // (sessionId, userId) => Promise
  updateSessionPreferences, // (sessionId, userId, prefs) => Promise
  setPlayerReady,       // (sessionId, userId, isReady) => Promise
  onSessionChange,      // (sessionId, callback) => unsubscribe
  onPlayersChange,      // (sessionId, callback) => unsubscribe
  onPreferencesChange,  // (sessionId, callback) => unsubscribe
} from '@/lib/firebase-utils'
```

### Create Session Example
```typescript
const result = await createSession('Alice')
// Returns: { sessionId: 'abc123...', userId: 'user_xyz' }
```

### Join Session Example
```typescript
const result = await joinSession('abc123...', 'Bob')
// Returns: { userId: 'user_abc' } or null if failed
```

### Update Preferences Example
```typescript
await updateSessionPreferences(sessionId, userId, {
  destination: 'Japan',
  budget: 'high',
  interests: ['adventure', 'food'],
  selectedImages: ['url1', 'url2', ...]
})
```

## Component Quick Reference

### Use ImageSelector
```tsx
import { ImageSelector } from '@/components/multiplayer/image-selector'

export function MyForm() {
  return <ImageSelector />
}
```

### Use ProgressIndicator
```tsx
import { ProgressIndicator } from '@/components/multiplayer/progress-indicator'

export function MyPage() {
  return (
    <div>
      <ProgressIndicator />
      {/* Other content */}
    </div>
  )
}
```

### Use AnalysisResults
```tsx
import { AnalysisResults } from '@/components/multiplayer/analysis-results'

export function ResultsPage() {
  return <AnalysisResults />
}
```

## API Endpoints

### POST /api/multiplayer/analyze
```typescript
const response = await fetch('/api/multiplayer/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferences: {
      budget: 'high',
      interests: ['adventure', 'food'],
      selectedImages: ['url1', 'url2'],
      dateRange: { start: '2024-01-01', end: '2024-01-10' }
    },
    playerCount: 2
  })
})

const results = await response.json()
// Returns: {
//   countries: [{ name, matchPercentage, climate, activities, ... }],
//   summary: 'Based on 2 travelers...',
//   userProfile: { ... }
// }
```

## Database Schema

```
sessions/{sessionId}/
├── sessionId: string
├── createdAt: number (timestamp)
├── host: { userId, username }
├── status: 'active' | 'completed'
├── expiresAt: number (timestamp)
├── players/
│   └── {userId}: { userId, username, joinedAt, isReady, lastUpdated }
├── preferences/
│   ├── destination?: string
│   ├── budget?: string
│   ├── interests?: string[]
│   ├── dateRange?: { start, end }
│   └── selectedImages?: string[]
├── analysisResults: object | null
└── lastModifiedBy: string
```

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://xxxxxxx.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxx
```

## Common Tasks

### Get Current Player
```typescript
const { players, userId } = useMultiplayer()
const currentPlayer = players.find(p => p.userId === userId)
console.log(currentPlayer?.username, currentPlayer?.isReady)
```

### Check If Host
```typescript
const { isHost, session, userId } = useMultiplayer()
console.log(isHost)  // true or false
console.log(session?.host.userId === userId)  // Same thing
```

### Count Ready Players
```typescript
const { players } = useMultiplayer()
const readyCount = players.filter(p => p.isReady).length
console.log(`${readyCount}/${players.length} ready`)
```

### Sync Image Selection
```typescript
const { updatePreferences } = useMultiplayer()

const onImageSelected = async (imageUrl: string) => {
  await updatePreferences({
    selectedImages: [...(preferences.selectedImages || []), imageUrl]
  })
}
```

### Handle Analysis Results
```typescript
const { session, submitAnalysis } = useMultiplayer()

const handleAnalyze = async (results: any) => {
  await submitAnalysis(results)
  // Results now available in session.analysisResults
}
```

## Debugging

### Check Session in Console
```javascript
// In browser console:
const { useMultiplayer } = require('@/contexts/multiplayer-context')
// Note: Can't use hooks in console, use React DevTools instead

// Or with Network tab:
// Look for Firebase calls to check data
```

### Monitor Firebase
1. Open Firebase Console
2. Go to Database section
3. Expand sessions/{yourSessionId}
4. Watch data update in real-time

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Session not found" | Wrong session ID | Copy ID again, check spelling |
| No real-time updates | Firebase env var wrong | Verify NEXT_PUBLIC_FIREBASE_* vars |
| Images not loading | API error | Check `/api/generate-images` endpoint |
| "Mark as Ready" button greyed | Still loading | Wait for form to finish syncing |
| Session expires immediately | Server time off | Check server/client time sync |

## Performance Tips

1. **Reduce re-renders:** Use `useCallback` for handlers
2. **Optimize Firebase reads:** Subscribe only to needed data
3. **Lazy load images:** Load categories on demand
4. **Batch updates:** Group preference changes
5. **Monitor latency:** Open DevTools Network tab

## Links

- [Complete Setup Guide](./MULTIPLAYER_SETUP.md)
- [Deployment & Testing](./MULTIPLAYER_DEPLOYMENT.md)
- [Full Implementation](./MULTIPLAYER_IMPLEMENTATION.md)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Docs](https://firebase.google.com/docs)

## Troubleshooting

### Session Won't Load
1. Check Firebase env vars in Vercel
2. Verify session ID in URL
3. Check Firebase Database has sessions
4. Try different browser/incognito

### Preferences Not Syncing
1. Check Network tab for Firebase errors
2. Verify player is in same session
3. Hard refresh (Ctrl+Shift+R)
4. Check browser console logs

### Analysis Returns Error
1. Verify preferences are complete
2. Check all players marked ready
3. Check `/api/multiplayer/analyze` working
4. Review API response in Network tab

## Support

Check these files for detailed help:
- `MULTIPLAYER_SETUP.md` - Setup instructions
- `MULTIPLAYER_DEPLOYMENT.md` - Testing & deployment
- `MULTIPLAYER_IMPLEMENTATION.md` - Complete documentation
