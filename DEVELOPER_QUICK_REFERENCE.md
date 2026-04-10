# Developer Quick Reference

Quick reference for working with the API integration system.

## Import Examples

```typescript
// Caching
import { imageCache, eventCache, destinationCache, generateCacheKey } from '@/lib/cache'

// Country coordinates
import { getCountryCoordinates, getAllCountries, calculateDistance } from '@/lib/country-coordinates'

// Image generation
import { generateImages, type GeneratedImage, type ImageMetadata } from '@/lib/image-generator'

// Preference analysis
import { 
  analyzePreferences, 
  createPreferenceProfile,
  type PreferenceProfile 
} from '@/lib/preferences-analyzer'

// Destination matching
import { 
  matchDestinations, 
  getTopDestinations,
  type DestinationMatch 
} from '@/lib/destination-matcher'

// Events
import { 
  fetchEventsByCountry, 
  type ProcessedEvent 
} from '@/lib/eventbrite-client'
```

## Common Tasks

### Generate Images with Metadata

```typescript
const images = await generateImages('beach vacation', 3)
// Returns: GeneratedImage[] with metadata

images.forEach(img => {
  console.log(img.url)
  console.log(img.metadata.mood)      // calm, adventurous, etc
  console.log(img.metadata.climate)   // tropical, temperate, etc
})
```

### Analyze User Preferences

```typescript
import { analyzePreferences, createPreferenceProfile } from '@/lib/preferences-analyzer'

const imageMetadata = images.map(img => img.metadata)
const preferences = analyzePreferences(imageMetadata)
const profile = createPreferenceProfile(preferences)

console.log(profile.dominantMood)        // User's main mood
console.log(profile.preferredClimate)    // User's preferred climate
console.log(profile.foodPreferences)     // Top 3 food styles
```

### Match Destinations

```typescript
import { getTopDestinations } from '@/lib/destination-matcher'

const topDests = getTopDestinations(profile, 3)

topDests.forEach(dest => {
  console.log(`${dest.countryName}: ${dest.confidenceScore}%`)
  console.log(`  Activity: ${dest.scoreBreakdown.activityScore}%`)
  console.log(`  Climate: ${dest.scoreBreakdown.climateScore}%`)
  console.log(`  Mood: ${dest.scoreBreakdown.moodScore}%`)
  console.log(`  Food: ${dest.scoreBreakdown.foodScore}%`)
})
```

### Fetch Events for Country

```typescript
import { fetchEventsByCountry } from '@/lib/eventbrite-client'

const events = await fetchEventsByCountry(
  'US',                                    // Country code
  '2024-06-01',                           // Start date
  '2024-06-30',                           // End date
  { mood: 'adventurous', activityLevel: 'high' }
)

events.forEach(event => {
  console.log(`${event.name} (${event.date})`)
  console.log(`Relevance: ${event.relevanceScore}%`)
})
```

### Use Caching

```typescript
import { imageCache, generateCacheKey } from '@/lib/cache'

const key = generateCacheKey('images', 'beach', 6)

// Try cache first
let images = imageCache.get(key)

if (!images) {
  // Not in cache, fetch
  images = await generateImages('beach', 6)
  
  // Store in cache
  imageCache.set(key, images)
}
```

### Get Country Coordinates

```typescript
import { getCountryCoordinates, calculateDistance } from '@/lib/country-coordinates'

const country = getCountryCoordinates('TH')
console.log(country.name)          // "Thailand"
console.log(country.latitude)      // 15.870032
console.log(country.radius)        // 150 km search radius

// Calculate distance
const distance = calculateDistance(
  15.870032, 100.992541,  // Thailand center
  13.7563, 100.5018       // Bangkok
)
console.log(distance)  // ~51 km
```

## API Endpoint Examples

### POST /api/generate-images

```bash
curl -X POST http://localhost:3000/api/generate-images \
  -H "Content-Type: application/json" \
  -d '{"prompt": "beach vacation", "count": 6}'
```

Response:
```json
{
  "images": [...],
  "source": "api",
  "cached": false
}
```

### POST /api/analyze

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageMetadata": [...], "language": "en"}'
```

Response:
```json
{
  "userProfile": {...},
  "countries": [...],
  "summary": "..."
}
```

### POST /api/events

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "US",
    "startDate": "2024-06-01",
    "endDate": "2024-06-30",
    "userMood": "adventurous"
  }'
```

Response:
```json
{
  "events": [...],
  "country": "United States",
  "count": 6
}
```

## Type Definitions

### ImageMetadata

```typescript
interface ImageMetadata {
  tags: string[]
  mood: string                              // calm, adventurous, cultural, luxury
  climate: string                           // tropical, temperate, cold, desert
  environment: string                       // urban, nature, beach, mountain
  activity_level: 'low' | 'medium' | 'high'
  food_style: string                        // fine_dining, street_food, etc
}
```

### PreferenceProfile

```typescript
interface PreferenceProfile {
  dominantMood: string
  preferredClimate: string
  preferredEnvironment: string
  activityLevel: 'low' | 'medium' | 'high'
  foodPreferences: string[]
  allTags: string[]
}
```

### DestinationMatch

```typescript
interface DestinationMatch {
  countryCode: string
  countryName: string
  confidenceScore: number           // 0-100
  scoreBreakdown: {
    activityScore: number
    climateScore: number
    moodScore: number
    foodScore: number
  }
  positives: string[]
  negatives: string[]
  climate: string
  activities: string[]
  foodHighlights: string[]
  hotels: HotelSuggestion[]
}
```

### ProcessedEvent

```typescript
interface ProcessedEvent {
  id: string
  name: string
  date: string                      // YYYY-MM-DD
  url: string
  category: string
  image?: string
  relevanceScore: number            // 0-100
  description?: string
}
```

## Debugging

### Check Cache Status

```typescript
import { imageCache, destinationCache } from '@/lib/cache'

const hasImage = imageCache.has('key')
const hasDest = destinationCache.has('key')

// Cleanup expired entries
imageCache.cleanup()
destinationCache.cleanup()

// Clear all cache
imageCache.clear()
```

### Validate Responses

```typescript
import { validateAnalyzeResponse, validateEventsResponse } from '@/lib/integration-test'

const analyzeResp = await fetch('/api/analyze', {...})
const data = await analyzeResp.json()

if (validateAnalyzeResponse(data)) {
  console.log('Valid response')
} else {
  console.error('Invalid response format')
}
```

### Log Preference Profile

```typescript
const profile = createPreferenceProfile(preferences)

console.log('User Profile:')
console.log(`  Mood: ${profile.dominantMood}`)
console.log(`  Climate: ${profile.preferredClimate}`)
console.log(`  Environment: ${profile.preferredEnvironment}`)
console.log(`  Activity: ${profile.activityLevel}`)
console.log(`  Foods: ${profile.foodPreferences.join(', ')}`)
console.log(`  Tags: ${profile.allTags.join(', ')}`)
```

## Supported Values

### Moods
- calm
- adventurous
- cultural
- luxury

### Climates
- tropical
- temperate
- cold
- desert
- arid
- mediterranean

### Environments
- urban
- nature
- beach
- mountain
- resort
- countryside

### Activity Levels
- low
- medium
- high

### Food Styles
- fine_dining
- street_food
- vegetarian
- seafood
- traditional
- fusion
- casual

## Country Codes

Standard ISO 3166-1 alpha-2 codes:

```
US, JP, TH, FR, AU, GB, DE, IT, ES, CA, MX, BR, SG, NZ, KR, IN
```

## Configuration

### Adjust Cache TTL

Edit `/lib/cache.ts`:
```typescript
export const imageCache = new InMemoryCache(3600);      // 1 hour
export const eventCache = new InMemoryCache(7200);      // 2 hours
export const destinationCache = new InMemoryCache(14400); // 4 hours
```

### Adjust Scoring Weights

Edit `/lib/destination-matcher.ts`:
```typescript
const WEIGHTS = {
  ACTIVITY: 0.4,  // 40%
  CLIMATE: 0.3,   // 30%
  MOOD: 0.2,      // 20%
  FOOD: 0.1,      // 10%
}
```

### Add New Country

Edit `/lib/country-coordinates.ts` and `/lib/destination-matcher.ts`:

```typescript
// coordinates.ts
US: {
  name: 'United States',
  code: 'US',
  latitude: 37.0902,
  longitude: -95.7129,
  radius: 200,
}

// matcher.ts
US: {
  name: 'United States',
  climate: 'varied',
  activities: ['hiking', 'beach', ...],
  // ... profile data
}
```

## Useful Links

- [API Documentation](./API_INTEGRATION.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Cache not working | Check TTL, call `.cleanup()` |
| API returns fallback | API key invalid or not set |
| Country not found | Use valid ISO code (US, JP, TH, etc) |
| No events returned | Country not supported or date range empty |
| Slow response | First request will be slow (cached after) |

---

**Last Updated:** March 2024
