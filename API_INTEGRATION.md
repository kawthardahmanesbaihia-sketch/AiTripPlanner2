# API Integration Documentation

This document describes the three integrated APIs for the AI Trip Planner application.

## Architecture Overview

The system follows this workflow:
1. **Image Generation** → User uploads images or generates travel inspiration images
2. **Preference Analysis** → Extract user travel preferences from image metadata
3. **Destination Matching** → Match user preferences to destinations with confidence scoring
4. **Event Integration** → Find events in recommended destinations

## 1. Image Generation API

**Endpoint:** `POST /api/generate-images`

**Purpose:** Generate travel inspiration images with structured metadata using Google Imagen API

### Request

```json
{
  "prompt": "tropical beach adventure vacation",
  "count": 6
}
```

### Response

```json
{
  "images": [
    {
      "url": "image_url",
      "prompt": "prompt_used",
      "metadata": {
        "tags": ["beach", "tropical"],
        "mood": "calm",
        "climate": "tropical",
        "environment": "beach",
        "activity_level": "low",
        "food_style": "seafood"
      }
    }
  ],
  "source": "api|fallback|cache",
  "cached": false
}
```

### Implementation Details

- **Library:** `/lib/image-generator.ts`
- **API Used:** Google Imagen API (with fallback to curated images)
- **Caching:** 1-hour TTL with in-memory cache
- **Fallback:** 5 curated images with full metadata when API unavailable

### Image Metadata Schema

Each image includes structured metadata for preference analysis:

- **tags**: Array of descriptive keywords
- **mood**: Travel mood (calm, adventurous, cultural, luxury)
- **climate**: Climate type (tropical, temperate, cold, desert)
- **environment**: Environment type (urban, nature, beach, mountain, resort)
- **activity_level**: Low, medium, or high intensity
- **food_style**: Food preference (fine_dining, street_food, vegetarian, seafood, traditional)

---

## 2. Preference Analysis & Destination Matching API

**Endpoint:** `POST /api/analyze`

**Purpose:** Analyze user preferences from images and match to destinations with weighted confidence scoring

### Request

```json
{
  "imageMetadata": [
    {
      "tags": ["hiking", "mountain"],
      "mood": "adventurous",
      "climate": "cold",
      "environment": "mountain",
      "activity_level": "high",
      "food_style": "casual"
    }
  ],
  "language": "en"
}
```

### Response

```json
{
  "userProfile": {
    "dominantMood": "adventurous",
    "preferredClimate": "temperate",
    "preferredEnvironment": "nature",
    "activityLevel": "high",
    "foodPreferences": ["casual", "traditional"]
  },
  "countries": [
    {
      "name": "United States",
      "code": "US",
      "matchPercentage": 78,
      "confidenceBreakdown": {
        "activity": 85,
        "climate": 70,
        "mood": 75,
        "food": 65
      },
      "positives": [
        "Great activities for high activity level",
        "Excellent food scene matching preferences"
      ],
      "negatives": [
        "Limited matching food styles"
      ],
      "climate": "varied",
      "activities": ["hiking", "rock_climbing", "surfing"],
      "foodHighlights": ["burgers", "bbq", "mexican"],
      "hotels": [
        {
          "name": "Hotel Name",
          "style": "luxury",
          "activity_level": "adventure"
        }
      ]
    }
  ],
  "summary": "Based on your visual preferences, United States is perfectly matched for you..."
}
```

### Confidence Scoring Algorithm

The system uses weighted feature matching to calculate confidence:

**Weights:**
- Activity Level: 40%
- Climate: 30%
- Mood: 20%
- Food Style: 10%

**Scoring:**
Each aspect is scored 0-100 based on how many user preferences match country options:
- `aspect_score = (matched_features / total_user_features) × 100`

**Final Score:**
```
confidence = (activity_score × 0.4) + 
             (climate_score × 0.3) + 
             (mood_score × 0.2) + 
             (food_score × 0.1)
```

### Implementation Details

- **Libraries:**
  - `/lib/preferences-analyzer.ts` - Extract user profile from images
  - `/lib/destination-matcher.ts` - Match destinations with weighted scoring
- **Caching:** 4-hour TTL for destination matches
- **Destinations:** 15+ supported countries with detailed profiles
- **Response Languages:** English, French, Arabic

---

## 3. Events API

**Endpoint:** `POST /api/events`

**Purpose:** Fetch events in recommended destinations filtered by user preferences and date range

### Request

```json
{
  "countryCode": "US",
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "userMood": "adventurous",
  "activityLevel": "high"
}
```

### Response

```json
{
  "events": [
    {
      "id": "evt_1",
      "name": "New York Marathon",
      "date": "2024-11-03",
      "url": "https://example.com",
      "category": "sports",
      "image": "image_url",
      "relevanceScore": 85,
      "description": "Annual NYC Marathon - high activity"
    }
  ],
  "cached": false,
  "country": "United States",
  "count": 6
}
```

### Event Filtering Logic

Events are filtered based on user mood:

- **calm**: Excludes high-energy events (nightlife, concerts, festivals, sports)
- **adventurous**: Boosts action-oriented events (sports, adventure, outdoors, nightlife)
- **cultural**: Prioritizes cultural/art events (museums, theater, festivals)

### Location-Based Filtering

Events are filtered using geolocation:
1. Convert country code to center coordinates
2. Search Eventbrite within configurable radius (default: 200km)
3. Filter by date range (start_date to end_date)

### Implementation Details

- **Library:** `/lib/eventbrite-client.ts`
- **API Used:** Eventbrite API (with mock event fallback)
- **Caching:** 2-hour TTL for event searches
- **Country Support:** 15 countries with center coordinates and search radius

---

## Environment Variables

Configure these environment variables for API integration:

```bash
# Google Imagen API (optional - uses fallback if not set)
GOOGLE_IMAGEN_API_KEY=your_api_key

# Eventbrite API (optional - uses mock events if not set)
EVENTBRITE_API_KEY=your_api_key
```

### Fallback Behavior

All APIs have graceful fallbacks:
- **Image Generation**: Curated images with metadata
- **Preference Analysis**: Works with any image metadata
- **Events**: Mock events for testing/demo

---

## Caching Strategy

In-memory caching with TTL (Time To Live):

```typescript
// Cache lifetimes
const imageCache = new InMemoryCache(3600);      // 1 hour
const eventCache = new InMemoryCache(7200);      // 2 hours
const destinationCache = new InMemoryCache(14400); // 4 hours
```

Cache keys are generated from request parameters:
```typescript
generateCacheKey('images', prompt, count);
generateCacheKey('analysis', JSON.stringify(imageMetadata));
generateCacheKey('events', countryCode, startDate, endDate);
```

Automatic cleanup of expired entries on each request.

---

## Supported Countries

The following 15 countries are supported with detailed profiles:

- United States (US)
- Japan (JP)
- Thailand (TH)
- France (FR)
- Australia (AU)
- United Kingdom (GB)
- Germany (DE)
- Italy (IT)
- Spain (ES)
- Canada (CA)
- Mexico (MX)
- Brazil (BR)
- Singapore (SG)
- New Zealand (NZ)
- South Korea (KR)
- India (IN)

Each country includes:
- Center coordinates for location-based filtering
- Search radius (150-250 km)
- Activities indexed by mood
- Food style specialties
- Hotel recommendations by price tier

---

## Error Handling

All APIs implement try-catch with graceful fallbacks:

```typescript
// Standard error response
{
  "error": "Description of error",
  "status": 400|500
}
```

Common error codes:
- `400`: Missing required parameters
- `400`: Invalid country code
- `500`: API request failed (uses fallback)

---

## Testing

Run the integration test:

```typescript
import { runIntegrationTest } from '@/lib/integration-test'

const result = await runIntegrationTest()
console.log(result)
```

This test validates the full workflow:
1. Image generation
2. Preference analysis
3. Destination matching
4. Event fetching

---

## Performance Considerations

- **Caching**: In-memory caching eliminates redundant API calls
- **Rate Limiting**: Fallback to cached/mock data prevents API overload
- **Lazy Loading**: Events only fetched for top destination
- **Cleanup**: Expired cache entries automatically removed

---

## Future Enhancements

Potential improvements:

- Redis caching for distributed systems
- Database persistence of user profiles
- Real-time event sync from Eventbrite
- Image generation with actual Imagen model
- User preference learning over time
- Multi-language event descriptions
- Custom radius configuration per country
