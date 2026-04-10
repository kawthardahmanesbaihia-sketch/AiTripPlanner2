/**
 * Destination data loading utilities
 * Handles API calls and fallback data management
 */

import {
  FALLBACK_WEATHER,
  FALLBACK_HOTELS,
  FALLBACK_RESTAURANTS,
  FALLBACK_ACTIVITIES,
  FALLBACK_DESTINATION_SUMMARY,
  FALLBACK_NEGATIVES,
} from "@/lib/fallback-data";

interface DestinationData {
  weather: any;
  hotels: any[];
  restaurants: any[];
  activities: any[];
  summary: string;
  negatives: string[];
}

export async function loadDestinationData(
  destinationId: number
): Promise<DestinationData> {
  try {
    const response = await fetch("/api/destination", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[v0] Destination API returned status:", response.status);
      return getDefaultData();
    }

    const data = await response.json();

    // Validate required fields
    if (!data.country || !data.startDate) {
      console.warn("[v0] Invalid destination data structure");
      return getDefaultData();
    }

    return {
      weather: data.weather || FALLBACK_WEATHER,
      hotels: Array.isArray(data.hotels) && data.hotels.length > 0 ? data.hotels : FALLBACK_HOTELS,
      restaurants: Array.isArray(data.restaurants) && data.restaurants.length > 0 ? data.restaurants : FALLBACK_RESTAURANTS,
      activities: Array.isArray(data.activities) && data.activities.length > 0 ? data.activities : FALLBACK_ACTIVITIES,
      summary: data.summary || FALLBACK_DESTINATION_SUMMARY,
      negatives: Array.isArray(data.negatives) && data.negatives.length > 0 ? data.negatives : FALLBACK_NEGATIVES,
    };
  } catch (error) {
    console.error("[v0] Error loading destination data:", error);
    return getDefaultData();
  }
}

export function getDefaultData(): DestinationData {
  return {
    weather: FALLBACK_WEATHER,
    hotels: FALLBACK_HOTELS,
    restaurants: FALLBACK_RESTAURANTS,
    activities: FALLBACK_ACTIVITIES,
    summary: FALLBACK_DESTINATION_SUMMARY,
    negatives: FALLBACK_NEGATIVES,
  };
}
