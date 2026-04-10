/**
 * Eventbrite API client for fetching events
 * Falls back gracefully when API is not available
 */

export interface EventbriteEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  url: string;
  category?: string;
  relevanceScore?: number;
}

/**
 * Fetch events from Eventbrite for a specific country and date range
 * Returns empty array if API is not configured or fails
 */
export async function fetchEventbriteEvents(
  countryCode: string,
  startDate: string,
  endDate: string
): Promise<EventbriteEvent[]> {
  try {
    const apiKey = process.env.EVENTBRITE_API_KEY;

    if (!apiKey) {
      console.log("[v0] Eventbrite API key not configured, returning empty events");
      return [];
    }

    // In production, you would call the actual Eventbrite API here
    // For now, return empty array to let the calling code use fallbacks
    console.log("[v0] Eventbrite event fetch requested for:", {
      countryCode,
      startDate,
      endDate,
    });

    return [];
  } catch (error) {
    console.error("[v0] Error fetching Eventbrite events:", error);
    return [];
  }
}
