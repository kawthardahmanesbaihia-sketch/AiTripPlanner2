# API Setup Guide

Complete instructions for setting up the three integrated APIs.

## Quick Start

The application works out-of-the-box with fallback data. Optional API keys enable real data:

1. **No setup required** → Uses curated images and mock events
2. **With API keys** → Real images and live events from Eventbrite

---

## Optional: Set Up Google Imagen API

Google Imagen is used to generate travel inspiration images with metadata.

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name: "Trip Planner" or similar)
3. Enable the "Generative AI API" or "Imagen API"

### Step 2: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key

### Step 3: Configure Environment Variable

In your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add variable:
   ```
   GOOGLE_IMAGEN_API_KEY=your_key_here
   ```
3. Redeploy

### Fallback Behavior

If `GOOGLE_IMAGEN_API_KEY` is not set:
- Uses 5 curated images with metadata
- All features work normally
- No image generation API calls

---

## Optional: Set Up Eventbrite API

Eventbrite API fetches real events in recommended destinations.

### Step 1: Create Eventbrite App

1. Go to [Eventbrite Developers](https://www.eventbrite.com/platform/api-keys/)
2. Sign in or create account
3. Create a new application
4. Accept terms

### Step 2: Get API Key

1. Go to **Developer Settings**
2. Copy your **Personal OAuth Token**
3. This is your API key

### Step 3: Configure Environment Variable

In your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add variable:
   ```
   EVENTBRITE_API_KEY=your_token_here
   ```
3. Redeploy

### Fallback Behavior

If `EVENTBRITE_API_KEY` is not set:
- Uses mock events for testing/demo
- Includes realistic event data for each country
- All features work normally

---

## Testing Without API Keys

The app includes complete fallback data:

### Available Test Data

**Image Generation:**
- 5 curated images covering different travel styles
- Full metadata for preference analysis
- Covers: adventure, beach, city, cultural, luxury

**Preferences Analysis:**
- Works with any image metadata provided
- Matches 15+ supported countries
- Weighted confidence scoring works normally

**Events:**
- Mock events for all 15 supported countries
- Realistic event data (names, dates, categories)
- Filtered by user preferences (mood, activity level)

### Testing Workflow

1. Upload images (or generate with fallback)
2. System analyzes preferences automatically
3. Top 3 destinations returned with confidence scores
4. Events shown for recommended destinations
5. Everything works without API keys

---

## API Key Validation

The system validates API keys on each request:

```typescript
// Check if API key is configured
const apiKey = process.env.GOOGLE_IMAGEN_API_KEY

if (!apiKey) {
  console.warn('Using fallback images')
  return FALLBACK_IMAGES
}

// Use API key for real requests
const response = await fetch(endpoint, {
  headers: {
    'x-goog-api-key': apiKey
  }
})
```

### Handling Invalid Keys

If an API key is invalid:
1. API request fails
2. System catches error
3. Falls back to curated/mock data
4. User sees fallback content
5. No errors shown (graceful degradation)

---

## Development vs Production

### Development (Local Testing)

Run without API keys:
```bash
npm run dev
# App works with fallback data
```

Test with real APIs (optional):
```bash
# Add to .env.local
GOOGLE_IMAGEN_API_KEY=your_key
EVENTBRITE_API_KEY=your_token

npm run dev
```

### Production (Vercel Deployment)

1. Deploy with `git push`
2. Add API keys in **Settings** → **Environment Variables**
3. Redeploy or wait for automatic redeploy
4. App uses real APIs if keys are set

---

## Troubleshooting

### "API request failed" error

**Cause:** API key is invalid or rate-limited

**Solution:**
1. Verify key is correct in Environment Variables
2. Check API quotas on provider dashboard
3. Try again after 1 hour
4. Fallback data is used automatically

### Missing images or events

**Cause:** No API key configured

**Solution:**
- Add `GOOGLE_IMAGEN_API_KEY` for real images
- Add `EVENTBRITE_API_KEY` for real events
- Or use fallback data (fully functional)

### Slow response times

**Cause:** First request for new data (not cached)

**Solution:**
- Caching is automatic (1-4 hour TTL)
- Second request will be faster
- In-memory cache resets on server restart

### Country not supported for events

**Supported countries:** US, JP, TH, FR, AU, GB, DE, IT, ES, CA, MX, BR, SG, NZ, KR, IN

**Solution:** API supports 15 countries - destinations show events only for these

---

## Configuration Reference

### Environment Variables

```bash
# Optional: Google Imagen API for image generation
GOOGLE_IMAGEN_API_KEY=sk-...

# Optional: Eventbrite API for real events
EVENTBRITE_API_KEY=...
```

### Cache Configuration

Edit `/lib/cache.ts` to adjust TTL values:

```typescript
export const imageCache = new InMemoryCache(3600);      // 1 hour
export const eventCache = new InMemoryCache(7200);      // 2 hours
export const destinationCache = new InMemoryCache(14400); // 4 hours
```

### Search Radius

Edit `/lib/country-coordinates.ts` to adjust event search radius:

```typescript
US: {
  name: 'United States',
  code: 'US',
  latitude: 37.0902,
  longitude: -95.7129,
  radius: 200, // kilometers
}
```

### Confidence Score Weights

Edit `/lib/destination-matcher.ts` to adjust scoring:

```typescript
const WEIGHTS = {
  ACTIVITY: 0.4,  // 40%
  CLIMATE: 0.3,   // 30%
  MOOD: 0.2,      // 20%
  FOOD: 0.1,      // 10%
}
```

---

## API Limits

### Google Imagen API

- Free tier: Limited requests per month
- Paid: Pay-as-you-go pricing
- Rate limits: Varies by tier
- Documentation: https://cloud.google.com/vision/generative-ai/docs

### Eventbrite API

- Rate limit: 1000 requests per hour
- Free tier available
- OAuth authentication required
- Documentation: https://www.eventbrite.com/platform/api/

---

## Security Notes

- API keys should never be exposed in client code
- Always use environment variables
- Keys are server-side only (not sent to browser)
- Git should ignore `.env.local` file
- Rotate keys regularly in production

---

## Support

If you encounter issues:

1. Check this guide first
2. Review the API documentation in `API_INTEGRATION.md`
3. Check error logs in Vercel dashboard
4. Verify API keys are correctly set
5. Ensure country codes are valid (ISO 3166-1 alpha-2)

The fallback system ensures the app always works, even without API keys.
