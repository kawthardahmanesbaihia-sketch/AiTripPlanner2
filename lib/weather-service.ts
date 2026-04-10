/**
 * Weather services for real-time and estimated weather data
 * Handles API calls and fallbacks
 */

import { mapWeatherCondition } from "@/lib/weather-utils";
import { getClimateEstimate } from "@/lib/climate-data";

export interface WeatherResponse {
  type: "real" | "climate";
  temperature: string;
  condition: string;
  icon: string;
  description: string;
  humidity?: number;
  windSpeed?: string;
  feelsLike?: string;
}

/**
 * Fetch real weather data from OpenWeatherMap API
 * Returns null if API is unavailable or city is not found
 */
export async function getRealWeather(city: string): Promise<WeatherResponse | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.log("[v0] OpenWeatherMap API key not configured");
      return null;
    }

    console.log("[v0] Fetching real weather for:", city);

    // Use OpenWeatherMap API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn("[v0] Weather API returned status:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.main || !data.weather) {
      console.warn("[v0] Unexpected weather API response format");
      return null;
    }

    const weatherCode = data.weather[0].id;
    const { condition, icon } = mapWeatherCondition(weatherCode, "openweather");

    return {
      type: "real",
      temperature: `${Math.round(data.main.temp)}°C`,
      condition,
      icon,
      description: `Current weather in ${city}: ${condition}`,
      humidity: data.main.humidity,
      windSpeed: `${Math.round(data.wind.speed)} m/s`,
      feelsLike: `${Math.round(data.main.feels_like)}°C`,
    };
  } catch (error) {
    console.error("[v0] Error fetching real weather:", error);
    return null;
  }
}

/**
 * Get climate-based weather estimate for a country/city
 * Used when travel date is > 7 days away
 */
export async function getClimateBasedWeather(
  country: string,
  month: string,
  city?: string
): Promise<WeatherResponse> {
  try {
    console.log("[v0] Using climate estimate for:", { country, month, city });

    const climateData = getClimateEstimate(country, month);

    if (!climateData) {
      console.warn("[v0] Climate data returned null, using fallback");
      return {
        type: "climate",
        temperature: "15-25°C",
        condition: "Comfortable",
        icon: "🌍",
        description: `Typical weather for ${country} in ${month}`,
      };
    }

    // Map condition to icon
    const iconMap: Record<string, string> = {
      "Sunny": "☀️",
      "Sunny & Dry": "☀️",
      "Sunny & Hot": "☀️",
      "Very Hot & Sunny": "☀️",
      "Hot & Sunny": "☀️",
      "Warm & Sunny": "☀️",
      "Clear": "☀️",
      "Clear & Dry": "☀️",
      "Mostly Clear": "🌤️",
      "Mostly Cloudy": "⛅",
      "Partly Cloudy": "⛅",
      "Cloudy": "☁️",
      "Overcast": "☁️",
      "Mist": "🌫️",
      "Fog": "🌫️",
      "Rainy": "🌧️",
      "Rainy & Hot": "🌧️",
      "Rainy & Warm": "🌧️",
      "Rain": "🌧️",
      "Thunderstorm": "⛈️",
      "Thundery": "⛈️",
      "Snow": "❄️",
      "Snowy": "❄️",
      "Cold": "❄️",
      "Very Cold": "🥶",
      "Cool": "🌤️",
      "Cool & Dry": "🌤️",
      "Cool & Rainy": "🌧️",
      "Pleasant": "🌤️",
      "Mild": "🌤️",
      "Warm": "☀️",
      "Hot": "🔥",
      "Very Hot": "🔥",
      "Hot & Humid": "💦",
      "Humid": "💦",
      "Warm & Humid": "💦",
      "Hot & Rainy": "⛈️",
      "Warm & Rainy": "🌧️",
      "Dry": "☀️",
      "Dry Season": "☀️",
      "Wet": "🌧️",
    };

    const icon = iconMap[climateData.condition] || climateData.icon || "🌍";

    const locationName = city ? `${city}, ${country}` : country;

    return {
      type: "climate",
      temperature: climateData.temp,
      condition: climateData.condition,
      icon,
      description: `${climateData.description} in ${locationName}. This is typical weather for this time of year.`,
    };
  } catch (error) {
    console.error("[v0] Error in getClimateBasedWeather:", error);
    return {
      type: "climate",
      temperature: "15-25°C",
      condition: "Comfortable",
      icon: "🌍",
      description: `Typical pleasant weather in ${country}`,
    };
  }
}

/**
 * Get weather data - uses real API for near dates, climate data for far dates
 * This is the main entry point for weather information
 */
export async function getWeatherForTravel(
  country: string,
  city: string | undefined,
  travelDate: string,
  month: string
): Promise<WeatherResponse> {
  try {
    console.log("[v0] Starting getWeatherForTravel:", { country, city, travelDate, month });
    
    const daysUntilTravel = Math.ceil(
      (new Date(travelDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log("[v0] Weather request - Days until travel:", daysUntilTravel);

    // Use real weather API for dates within 7 days
    if (daysUntilTravel <= 7 && daysUntilTravel >= 0 && city) {
      try {
        console.log("[v0] Using real weather API (travel within 7 days)");
        const realWeather = await getRealWeather(city);

        if (realWeather) {
          console.log("[v0] Real weather obtained successfully");
          return realWeather;
        }

        console.log("[v0] Real weather API failed or returned null, falling back to climate data");
      } catch (apiError) {
        console.warn("[v0] Real weather API error:", apiError);
      }
    }

    // Use climate data for all other cases
    try {
      console.log("[v0] Using climate-based weather (travel > 7 days or API unavailable)");
      const climateWeather = await getClimateBasedWeather(country, month, city);
      console.log("[v0] Climate weather obtained successfully");
      return climateWeather;
    } catch (climateError) {
      console.error("[v0] Error getting climate weather:", climateError);
      // Return safe fallback
      return {
        type: "climate",
        temperature: "15-25°C",
        condition: "Comfortable",
        icon: "🌍",
        description: "Typical pleasant weather for travel",
      };
    }
  } catch (error) {
    console.error("[v0] Unexpected error in getWeatherForTravel:", error);
    // Return safe fallback
    return {
      type: "climate",
      temperature: "15-25°C",
      condition: "Comfortable",
      icon: "🌍",
      description: "Typical pleasant weather for travel",
    };
  }
}
