# Weather Feature Documentation

## Overview

The weather feature provides real-time and climate-based weather data for travel planning. It intelligently switches between live weather APIs for near-future dates and historical climate data for distant dates.

## Architecture

### Core Components

1. **Weather Utilities** (`lib/weather-utils.ts`)
   - `getDaysDifference()`: Calculate days until travel date
   - `getMonthName()`: Extract month from date
   - `shouldUseRealWeather()`: Determine if real API or climate data should be used
   - `mapWeatherCondition()`: Convert API weather codes to human-readable conditions

2. **Climate Database** (`lib/climate-data.ts`)
   - Predefined climate data for 10+ countries
   - Monthly breakdown of temperature ranges and typical conditions
   - Fallback data for any missing entries

3. **Weather Service** (`lib/weather-service.ts`)
   - `getRealWeather()`: Fetch from OpenWeatherMap API
   - `getClimateBasedWeather()`: Use climate dataset for estimates
   - `getWeatherForTravel()`: Main entry point (intelligently chooses between real/climate)

4. **API Route** (`app/api/weather/route.ts`)
   - POST endpoint for weather requests
   - GET endpoint for query-based requests
   - Built-in caching (6-hour TTL)

5. **UI Component** (`components/weather-card.tsx`)
   - Beautiful card display
   - Loading skeletons
   - Shows temperature, condition, icon, and description
   - Additional details (humidity, wind speed)
   - Data source indicator (Real vs Estimated)

6. **Demo Page** (`app/weather/page.tsx`)
   - Interactive weather checker
   - Country/city/date selection
   - Real-time weather card display
   - Feature highlights

## Usage

### Using the WeatherCard Component

```tsx
import { WeatherCard } from "@/components/weather-card";

export function MyComponent() {
  return (
    <WeatherCard
      country="France"
      city="Paris"
      date="2026-07-15"
    />
  );
}
```

### API Endpoint

**POST Request:**
```bash
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "country": "France",
    "city": "Paris",
    "date": "2026-07-15"
  }'
```

**GET Request:**
```bash
curl "http://localhost:3000/api/weather?country=France&city=Paris&date=2026-07-15"
```

**Response:**
```json
{
  "type": "real",
  "temperature": "22°C",
  "condition": "Partly Cloudy",
  "icon": "⛅",
  "description": "Current weather in Paris: Partly Cloudy",
  "humidity": 65,
  "windSpeed": "3.5 m/s",
  "feelsLike": "20°C"
}
```

## Logic Flow

```
User selects destination and date
           ↓
Calculate days until travel (getDaysDifference)
           ↓
Is travel within 7 days?
  ├─ YES → Fetch real weather (getRealWeather)
  │         ├─ API available? → Return real weather with current conditions
  │         └─ API failed? → Fall through to climate data
  │
  └─ NO → Use climate data (getClimateBasedWeather)
           ├─ Get month from travel date
           └─ Return typical weather for that month/country

Return formatted WeatherResponse
```

## Configuration

### Required Environment Variables

Add to your `.env.local` file:

```env
# OpenWeatherMap API (optional - falls back to climate data if not provided)
OPENWEATHER_API_KEY=your_api_key_here
```

Get a free API key from: https://openweathermap.org/api

### Optional Configuration

The weather API uses the following defaults:
- **Real Weather API TTL**: 1 hour
- **Cache TTL**: 6 hours
- **Real Weather Threshold**: 7 days

## Climate Database Coverage

Currently includes climate data for:
- United States
- France
- Japan
- Thailand
- Spain
- Italy
- Australia
- Greece
- Brazil
- Canada
- Mexico

### Adding New Countries

To add a new country to the climate database, edit `lib/climate-data.ts`:

```typescript
export const climateDatabase: Record<string, Record<string, ClimateData>> = {
  "NewCountry": {
    January: { temp: "5-15°C", condition: "Cool", description: "..." },
    // ... rest of months
  },
};
```

## Error Handling

The feature implements graceful degradation:

1. **Real Weather API fails** → Falls back to climate data
2. **Country not in database** → Returns generic fallback data
3. **Invalid date** → Returns safe default weather

All errors are logged with `[v0]` prefix for debugging.

## Caching Strategy

- **Real weather data**: 1 hour cache (frequent updates needed)
- **Climate estimates**: 6 hours cache (static data, no need to update often)
- **Cache key**: Generated from country + city + date combination
- **Automatic cleanup**: Expired entries are removed on next access

## Integration Examples

### With Destination Page

```tsx
import { WeatherCard } from "@/components/weather-card";

export function DestinationPage({ destination, travelDate }) {
  return (
    <div>
      {/* ... other content ... */}
      <WeatherCard 
        country={destination.name}
        city={destination.capital}
        date={travelDate}
      />
    </div>
  );
}
```

### In a Form

```tsx
function TravelPlanner() {
  const [date, setDate] = useState("");
  const [country, setCountry] = useState("");

  return (
    <div>
      <input 
        type="date" 
        onChange={(e) => setDate(e.target.value)} 
      />
      <select onChange={(e) => setCountry(e.target.value)}>
        {/* countries */}
      </select>
      {date && country && (
        <WeatherCard country={country} date={date} />
      )}
    </div>
  );
}
```

## Testing

Visit the demo page at `/weather` to test the feature interactively.

### Test Cases

1. **Travel within 7 days with city** → Should fetch real weather
2. **Travel > 7 days** → Should show climate estimate
3. **Invalid date** → Should show error gracefully
4. **Missing country** → Should use default fallback

## Performance

- **First load**: API call + response (depends on weather API speed)
- **Cached requests**: Instant (in-memory cache)
- **Climate estimates**: Instant (no API call needed)
- **Typical response time**: 100-500ms for real weather, <10ms for climate data

## Future Improvements

- [ ] Add more countries to climate database
- [ ] Implement hourly forecast for real weather
- [ ] Add UV index and pollen data
- [ ] Weather alerts for severe conditions
- [ ] Multi-day forecast
- [ ] Integration with travel recommendations
