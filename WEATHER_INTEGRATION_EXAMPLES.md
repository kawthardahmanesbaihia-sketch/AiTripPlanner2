// Weather Feature Integration Examples

// ============================================
// Example 1: Simple Integration in a Component
// ============================================

import { WeatherCard } from "@/components/weather-card";

export function DestinationHighlight() {
  return (
    <div className="space-y-6">
      <h2>Plan Your Trip</h2>
      <WeatherCard
        country="France"
        city="Paris"
        date="2026-07-15"
      />
    </div>
  );
}

// ============================================
// Example 2: Dynamic Weather Based on User Input
// ============================================

"use client";

import { useState } from "react";
import { WeatherCard } from "@/components/weather-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TravelPlanner() {
  const [country, setCountry] = useState("France");
  const [date, setDate] = useState("2026-07-15");
  const [showWeather, setShowWeather] = useState(false);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button onClick={() => setShowWeather(true)}>
        Check Weather
      </Button>

      {showWeather && (
        <WeatherCard country={country} date={date} />
      )}
    </div>
  );
}

// ============================================
// Example 3: Using the Weather API Directly
// ============================================

async function getWeatherData(country: string, date: string) {
  const response = await fetch("/api/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      country,
      city: undefined,
      date,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  return response.json();
}

// Usage:
const weather = await getWeatherData("France", "2026-07-15");
console.log(weather.temperature); // "22°C"
console.log(weather.condition);   // "Partly Cloudy"

// ============================================
// Example 4: Query-based API Fetching
// ============================================

async function fetchWeatherByQuery(
  country: string,
  city: string,
  date: string
) {
  const params = new URLSearchParams({
    country,
    city,
    date,
  });

  const response = await fetch(`/api/weather?${params.toString()}`);
  return response.json();
}

// Usage:
const weather = await fetchWeatherByQuery("France", "Paris", "2026-07-15");

// ============================================
// Example 5: In Destination Listing Page
// ============================================

interface DestinationCardProps {
  name: string;
  travelDate: string;
  city?: string;
}

export function DestinationCard({
  name,
  travelDate,
  city,
}: DestinationCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3>{name}</h3>
      <p>Travel Date: {new Date(travelDate).toLocaleDateString()}</p>

      {/* Weather for this destination */}
      <WeatherCard
        country={name}
        city={city}
        date={travelDate}
      />

      <button>Book Now</button>
    </div>
  );
}

// Usage in a map:
const destinations = [
  { name: "France", travelDate: "2026-07-15", city: "Paris" },
  { name: "Japan", travelDate: "2026-05-20", city: "Tokyo" },
  { name: "Thailand", travelDate: "2026-12-01", city: "Bangkok" },
];

export function DestinationList() {
  return (
    <div className="grid gap-4">
      {destinations.map((dest) => (
        <DestinationCard key={dest.name} {...dest} />
      ))}
    </div>
  );
}

// ============================================
// Example 6: Weather in Itinerary Builder
// ============================================

interface ItineraryDay {
  date: string;
  activities: string[];
}

export function ItineraryDayCard({
  date,
  activities,
  country,
}: ItineraryDay & { country: string }) {
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between mb-4">
        <h3>{dayOfWeek}</h3>
        <span className="text-sm text-gray-600">{date}</span>
      </div>

      {/* Show weather for this specific day */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <WeatherCard country={country} date={date} />
      </div>

      {/* Activities for this day */}
      <ul className="space-y-2">
        {activities.map((activity, idx) => (
          <li key={idx}>• {activity}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Example 7: Weather-Based Recommendations
// ============================================

async function getRecommendationWithWeather(
  country: string,
  date: string
) {
  // Fetch weather data
  const weatherRes = await fetch("/api/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, date }),
  });
  const weather = await weatherRes.json();

  // Build recommendation based on weather
  let recommendation = "";

  if (weather.type === "real") {
    recommendation = `Current weather in ${country}: ${weather.condition}. ${weather.description}`;
  } else {
    recommendation = `Expected weather in ${country}: ${weather.condition}. ${weather.description}`;
  }

  // Add packing suggestions based on condition
  if (weather.condition.toLowerCase().includes("rain")) {
    recommendation += " Pack an umbrella and waterproof jacket.";
  }
  if (weather.condition.toLowerCase().includes("cold")) {
    recommendation += " Bring warm layers and a coat.";
  }
  if (weather.condition.toLowerCase().includes("hot")) {
    recommendation += " Use sunscreen and light clothing.";
  }

  return recommendation;
}

// Usage:
const tip = await getRecommendationWithWeather("France", "2026-07-15");
console.log(tip);
// Output: "Expected weather in France: Sunny. In July, France is usually warm and sunny..."

// ============================================
// Example 8: Error Handling & Fallback
// ============================================

async function safeGetWeather(country: string, date: string) {
  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, date }),
    });

    if (!response.ok) {
      console.error("Weather API error:", response.status);
      return createFallbackWeather(country);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return createFallbackWeather(country);
  }
}

function createFallbackWeather(country: string) {
  return {
    type: "climate",
    temperature: "15-25°C",
    condition: "Comfortable",
    icon: "🌍",
    description: `Typical weather for ${country}`,
  };
}

// ============================================
// Example 9: Caching Weather Results in State
// ============================================

"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  type: "real" | "climate";
  temperature: string;
  condition: string;
  icon: string;
  description: string;
}

export function CachedWeatherDisplay({
  country,
  date,
}: {
  country: string;
  date: string;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      const cacheKey = `weather-${country}-${date}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        setWeather(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country, date }),
        });

        const data = await response.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setWeather(data);
      } catch (error) {
        console.error("Weather error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [country, date]);

  if (loading) return <div>Loading weather...</div>;
  if (!weather) return <div>Unable to load weather</div>;

  return (
    <div className="p-4 rounded border">
      <div className="text-3xl">{weather.icon}</div>
      <div className="font-bold">{weather.temperature}</div>
      <div className="text-sm text-gray-600">{weather.condition}</div>
      <div className="text-xs mt-2">{weather.description}</div>
    </div>
  );
}

// ============================================
// Example 10: Server-Side Rendering Weather
// ============================================

// This is a Server Component (default in Next.js 13+)
import { getWeatherForTravel } from "@/lib/weather-service";
import { getMonthName } from "@/lib/weather-utils";

export async function ServerWeatherDisplay({
  country,
  date,
}: {
  country: string;
  date: string;
}) {
  try {
    const month = getMonthName(new Date(date));
    const weather = await getWeatherForTravel(country, undefined, date, month);

    return (
      <div className="p-4 rounded border">
        <div className="text-3xl">{weather.icon}</div>
        <div className="font-bold">{weather.temperature}</div>
        <div>{weather.condition}</div>
        <div className="text-sm text-gray-600">{weather.description}</div>
        {weather.humidity && (
          <div>Humidity: {weather.humidity}%</div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching weather:", error);
    return <div>Unable to fetch weather data</div>;
  }
}

// ============================================
// END OF EXAMPLES
// ============================================
