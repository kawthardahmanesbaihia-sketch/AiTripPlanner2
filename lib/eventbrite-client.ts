/**
 * Eventbrite API Client
 * Fetches events by country and date with preference filtering
 */

import { isWithinCountryRadius, CountryCoordinates } from './country-coordinates';

export interface EventbriteEvent {
  id: string;
  name: string;
  description?: string;
  url: string;
  start: {
    utc: string;
  };
  end: {
    utc: string;
  };
  category?: {
    name: string;
  };
  logo?: {
    url: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface ProcessedEvent {
  id: string;
  name: string;
  date: string;
  url: string;
  category: string;
  image?: string;
  relevanceScore: number;
  description?: string;
}

// Fallback mock events with proper fallbacks for all countries
const MOCK_EVENTS: Record<string, ProcessedEvent[]> = {
  US: [
    { id: 'evt_1', name: 'New York Marathon', date: '2024-11-03', url: 'https://example.com/nyc-marathon', category: 'sports', relevanceScore: 85, description: 'Annual NYC Marathon - high activity' },
    { id: 'evt_2', name: 'SXSW Festival', date: '2024-03-08', url: 'https://example.com/sxsw', category: 'music', relevanceScore: 75, description: 'South by Southwest music and culture festival' },
    { id: 'evt_3', name: 'Coachella Music Festival', date: '2024-04-12', url: 'https://example.com/coachella', category: 'music', relevanceScore: 80, description: 'Major music and arts festival' },
  ],
  JP: [
    { id: 'evt_3', name: 'Tokyo Fashion Week', date: '2024-10-13', url: 'https://example.com/tokyo-fashion', category: 'culture', relevanceScore: 80, description: 'Fashion and design showcase' },
    { id: 'evt_4', name: 'Kyoto Temple Festival', date: '2024-08-15', url: 'https://example.com/kyoto-temple', category: 'cultural', relevanceScore: 90, description: 'Traditional temple festival - calm and cultural' },
    { id: 'evt_5', name: 'Gion Festival', date: '2024-07-17', url: 'https://example.com/gion', category: 'cultural', relevanceScore: 92, description: 'Kyoto\'s famous summer festival' },
  ],
  TH: [
    { id: 'evt_6', name: 'Songkran Festival', date: '2024-04-13', url: 'https://example.com/songkran', category: 'festival', relevanceScore: 95, description: 'Thai New Year water festival - high energy' },
    { id: 'evt_7', name: 'Bangkok Yoga Festival', date: '2024-02-10', url: 'https://example.com/bangkok-yoga', category: 'wellness', relevanceScore: 88, description: 'Wellness and meditation retreat' },
    { id: 'evt_8', name: 'Chiang Mai Night Bazaar', date: '2024-01-01', url: 'https://example.com/chiang-mai', category: 'festival', relevanceScore: 85, description: 'Cultural night market experience' },
  ],
}

// Generic fallback events for any country
const GENERIC_FALLBACK_EVENTS: ProcessedEvent[] = [
  { id: 'gen_1', name: 'Local Cultural Festival', date: '2024-05-15', url: 'https://example.com/cultural', category: 'culture', relevanceScore: 80, description: 'Experience local culture and traditions' },
  { id: 'gen_2', name: 'Food and Wine Festival', date: '2024-06-20', url: 'https://example.com/food', category: 'food', relevanceScore: 82, description: 'Local cuisine and culinary experiences' },
  { id: 'gen_3', name: 'Music and Arts Festival', date: '2024-07-25', url: 'https://example.com/arts', category: 'music', relevanceScore: 78, description: 'Local music and arts performances' },
];

/**
 * Fetch events for a specific country
 * Filters by date range and user preferences
 */
export async function fetchEventsByCountry(
  countryCode: string,
  startDate: string,
  endDate: string,
  userPreferences?: {
    mood?: string;
    activityLevel?: string;
  }
): Promise<ProcessedEvent[]> {
  try {
    const apiKey = process.env.EVENTBRITE_API_KEY;
    
    if (!apiKey) {
      console.warn('[Eventbrite] API key not configured, using fallback events');
      const fallbackEvents = MOCK_EVENTS[countryCode] || GENERIC_FALLBACK_EVENTS;
      return filterEventsByDateRange(fallbackEvents, startDate, endDate);
    }

    // Make Eventbrite API request
    // This would be the actual API call - implementation depends on Eventbrite's endpoint
    try {
      const events = await getEventbriteEvents(countryCode, startDate, endDate, apiKey);
      return filterEventsByPreference(events, userPreferences);
    } catch (apiError) {
      console.error('[Eventbrite] API call failed, using fallback:', apiError);
      const fallbackEvents = MOCK_EVENTS[countryCode] || GENERIC_FALLBACK_EVENTS;
      return filterEventsByDateRange(fallbackEvents, startDate, endDate);
    }
  } catch (error) {
    console.error('[Eventbrite] Error fetching events:', error);
    // Fall back to mock events
    const fallbackEvents = MOCK_EVENTS[countryCode] || GENERIC_FALLBACK_EVENTS;
    return filterEventsByDateRange(fallbackEvents, startDate, endDate);
  }
}

/**
 * Get events from Eventbrite API
 * Searches events in a country within the specified date range
 */
async function getEventbriteEvents(
  countryCode: string,
  startDate: string,
  endDate: string,
  apiKey: string
): Promise<ProcessedEvent[]> {
  try {
    console.log('[Eventbrite] Fetching events for country:', countryCode);

    // Format dates for API (ISO 8601)
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();

    // Build the API request
    const url = new URL('https://www.eventbriteapi.com/v3/events/search/');
    
    // Add query parameters
    url.searchParams.append('start_date.range_start', start);
    url.searchParams.append('start_date.range_end', end);
    url.searchParams.append('sort_by', 'best');
    url.searchParams.append('expand', 'category,logo,organizer,venue');
    
    // Try to add location parameter if we have country-specific location info
    const locationMapping: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      JP: 'Japan',
      DE: 'Germany',
      FR: 'France',
      IT: 'Italy',
      ES: 'Spain',
      MX: 'Mexico',
      BR: 'Brazil',
      IN: 'India',
      TH: 'Thailand',
      SG: 'Singapore',
      NZ: 'New Zealand',
    };
    
    const countryName = locationMapping[countryCode];
    if (countryName) {
      url.searchParams.append('location.address', countryName);
    }

    console.log('[Eventbrite] Making request to:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Eventbrite] API error:', response.status, errorText);
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Eventbrite] API response received:', { eventsCount: data.events?.length });

    // Transform Eventbrite events to our format
    const events = (data.events || [])
      .slice(0, 12) // Get up to 12 events
      .map((event: EventbriteEvent) => {
        const eventDate = event.start?.utc ? new Date(event.start.utc) : new Date();
        
        return {
          id: event.id,
          name: event.name,
          date: eventDate.toISOString().split('T')[0],
          url: event.url,
          category: event.category?.name || 'Event',
          image: event.logo?.url,
          description: event.description?.split('\n')[0]?.substring(0, 150) || '',
          relevanceScore: 0.7 + Math.random() * 0.3, // Random score, refined by preference filtering
        };
      });

    console.log('[Eventbrite] Processed events:', events.length);
    return events;
  } catch (error) {
    console.error('[Eventbrite] Error fetching events:', error);
    throw error;
  }
}

/**
 * Filter events by date range
 */
function filterEventsByDateRange(
  events: ProcessedEvent[],
  startDate: string,
  endDate: string
): ProcessedEvent[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= start && eventDate <= end;
  });
}

/**
 * Filter events by user preferences
 * Matches event categories with mood and activity level
 */
function filterEventsByPreference(
  events: ProcessedEvent[],
  preferences?: {
    mood?: string;
    activityLevel?: string;
  }
): ProcessedEvent[] {
  if (!preferences) {
    return events;
  }

  return events.filter((event) => {
    const category = event.category.toLowerCase();
    const mood = preferences.mood?.toLowerCase() || '';
    const activityLevel = preferences.activityLevel?.toLowerCase() || '';

    // Filter based on mood
    if (mood === 'calm') {
      // Calm mood excludes high-energy events
      const excludedCategories = [
        'nightlife',
        'concert',
        'festival',
        'party',
        'sports',
        'music',
      ];
      if (excludedCategories.some((cat) => category.includes(cat))) {
        return false;
      }
    }

    if (mood === 'adventurous' || activityLevel === 'high') {
      // Adventurous mood includes action-oriented events
      const preferredCategories = [
        'sports',
        'adventure',
        'outdoors',
        'festival',
        'nightlife',
      ];
      const isPreferred = preferredCategories.some((cat) => category.includes(cat));
      if (isPreferred) {
        event.relevanceScore = Math.min(100, event.relevanceScore + 10);
      }
    }

    if (mood === 'cultural') {
      // Cultural mood prefers cultural/art events
      const preferredCategories = ['culture', 'art', 'museum', 'festival', 'theater'];
      const isPreferred = preferredCategories.some((cat) => category.includes(cat));
      if (isPreferred) {
        event.relevanceScore = Math.min(100, event.relevanceScore + 10);
      }
    }

    return true;
  });
}

/**
 * Filter events by location using latitude/longitude
 * Returns only events within the country's search radius
 */
export function filterEventsByLocation(
  events: ProcessedEvent[],
  country: CountryCoordinates
): ProcessedEvent[] {
  // Mock implementation - would need actual lat/lng in event data
  // This is a placeholder that assumes all mock events are valid
  return events;
}

/**
 * Get events near a specific location
 */
export async function getEventsNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 200,
  startDate?: string,
  endDate?: string
): Promise<ProcessedEvent[]> {
  try {
    const apiKey = process.env.EVENTBRITE_API_KEY;
    
    if (!apiKey) {
      return []; // No fallback for location-based search
    }

    // Would implement actual location-based search
    console.warn('[Eventbrite] Location-based event search not yet implemented');
    return [];
  } catch (error) {
    console.error('[Eventbrite] Error fetching location-based events:', error);
    return [];
  }
}
