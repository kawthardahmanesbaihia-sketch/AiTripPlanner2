# Weather Feature Setup Guide

## Quick Start

The weather feature is ready to use out of the box! However, to enable real-time weather data for travel dates within 7 days, you'll need to configure an OpenWeatherMap API key.

## Step 1: Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up"
3. Create a free account
4. Go to your API keys section
5. Copy your default API key (or create a new one)

The free tier includes:
- 1,000 API calls per day
- Real-time weather data
- 5-day forecast
- No credit card required

## Step 2: Add Environment Variable

### For Local Development

Create or update `.env.local` in your project root:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key from step 1.

### For Vercel Deployment

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `OPENWEATHER_API_KEY`
   - **Value**: Your OpenWeatherMap API key
4. Redeploy your application

## Step 3: Restart Your Application

If running locally:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The weather feature will now fetch real-time data for travel dates within 7 days.

## Verification

### Check API Configuration

Visit: `http://localhost:3000/api/health`

You should see:
```json
{
  "apis": {
    "openweather": {
      "configured": true,
      "key": "Set"
    }
  },
  "weatherConfigured": true
}
```

### Test the Weather Feature

1. Navigate to `/weather` page
2. Select a country
3. Set a date within 7 days
4. Optionally add a city name
5. Click "Check Weather"

You should see real-time weather data with:
- Current temperature
- Live weather condition
- Humidity
- Wind speed
- "Live Weather" badge

## What Happens Without API Key?

The weather feature includes a **comprehensive fallback system**:

- ✓ All API requests work without a key
- ✓ For dates > 7 days: Uses climate estimates automatically
- ✓ For dates within 7 days without API key: Falls back to climate data
- ✓ All 11 supported countries have complete climate data
- ✓ No errors or broken UI

**Result**: Perfect experience either way!

## Climate Data Fallback

The feature includes pre-loaded climate data for these countries:

- United States (all regions combined)
- France (Paris area representative)
- Japan (mixed climate)
- Thailand (tropical)
- Spain (Mediterranean)
- Italy (Mediterranean)
- Australia (mixed)
- Greece (Mediterranean)
- Brazil (tropical/subtropical)
- Canada (northern)
- Mexico (subtropical)

Each country has monthly data including:
- Temperature ranges (e.g., "20-28°C")
- Typical weather condition (e.g., "Sunny", "Rainy")
- Detailed description

## Troubleshooting

### API Key Not Working

1. **Check key is correct**: Visit OpenWeatherMap API docs to verify format
2. **Check environment variable**: Ensure it's in `.env.local` (dev) or Vercel settings (production)
3. **Restart application**: Always restart after adding env vars
4. **Check API rate limits**: Free tier has 1,000 calls/day limit

### Still Showing Climate Data

This is normal! The feature intelligently:
- Uses real weather for dates within 7 days (if API key is set)
- Uses climate data for dates further out (always works)
- Falls back gracefully if API is unavailable

### Weather Card Not Loading

1. Check browser console for errors
2. Check server logs for error messages
3. Verify API key is set in environment variables
4. Try refreshing the page
5. Check `/api/health` endpoint for configuration status

## Advanced Configuration

### Custom Cache Duration

Edit `lib/weather-service.ts` to adjust API cache duration:

```typescript
// Change from default 3600 seconds (1 hour)
const response = await fetch(url, {
  next: { revalidate: 7200 }, // 2 hours
});
```

### Add More Climate Data

Edit `lib/climate-data.ts` to add more countries or months:

```typescript
"Argentina": {
  January: { temp: "20-35°C", condition: "Hot", description: "Summer heat" },
  // ... rest of months
}
```

### Custom Weather Icons

Edit the icon mapping in `lib/weather-service.ts`:

```typescript
const iconMap: Record<string, string> = {
  "Sunny": "☀️",          // Customize these
  "Rainy": "🌧️",
  // ... more mappings
};
```

## API Limits & Quotas

### OpenWeatherMap Free Tier

- **Calls per day**: 1,000
- **Calls per minute**: 60
- **Data freshness**: Updated every 10 minutes
- **Coverage**: Global

### Recommendations

- Use caching to minimize API calls (already implemented)
- For high-traffic apps, consider upgrading to paid tier
- Cache results on client side as well (optional)

## Contact & Support

- **OpenWeatherMap Support**: https://openweathermap.org/faq
- **API Documentation**: https://openweathermap.org/weather-conditions

## Feature Roadmap

- [x] Real-time weather for near dates
- [x] Climate estimates for far dates
- [x] Weather icons and conditions
- [x] Caching system
- [x] Error handling & fallbacks
- [x] Demo page
- [ ] Multi-day forecast
- [ ] Severe weather alerts
- [ ] More countries in climate database
