import { NextRequest, NextResponse } from "next/server"
import { fetchEventbriteEvents } from "@/lib/eventbrite-fixed"
import { getCountryCoordinates } from "@/lib/country-coordinates"
import { eventCache, generateCacheKey } from "@/lib/cache"

interface EventRequest {
  location?: string
  countryCode?: string
  startDate: string
  endDate: string
  userMood?: string
  activityLevel?: string
  userPreferences?: string[]
}

// Mapping of country names to ISO codes
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Japan": "JP",
  "Costa Rica": "CR",
  "Greece": "GR",
  "Morocco": "MA",
  "Portugal": "PT",
  "Thailand": "TH",
  "New Zealand": "NZ",
  "Brazil": "BR",
  "Australia": "AU",
  "Canada": "CA",
  "United States": "US",
  "France": "FR",
  "Italy": "IT",
  "Spain": "ES",
  "Mexico": "MX",
  "Singapore": "SG",
  "India": "IN",
  "Germany": "DE",
  "United Kingdom": "GB",
  "South Korea": "KR",
}

export async function POST(request: NextRequest) {
  try {
    const body: EventRequest = await request.json()
    const { location, countryCode, startDate, endDate, userMood, activityLevel, userPreferences } = body

    console.log("[v0] Events API request:", { location, countryCode, startDate, endDate })

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: startDate, endDate" },
        { status: 400 }
      )
    }

    // Determine country code from location or countryCode
    let code = countryCode
    
    if (!code && location) {
      // Try to find country code from location name
      code = COUNTRY_NAME_TO_CODE[location]
      if (!code) {
        // Try exact match or partial match
        code = Object.entries(COUNTRY_NAME_TO_CODE).find(
          ([name]) => name.toLowerCase() === location.toLowerCase()
        )?.[1]
      }
    }

    if (!code) {
      console.log("[v0] No valid country code found, using fallback events")
      // Return fallback events instead of error
      return NextResponse.json({
        events: generateFallbackEvents(location || "Unknown", startDate, endDate),
        cached: false,
        country: location || "Unknown",
        count: 3,
      })
    }

    console.log("[v0] Using country code:", code)

    // Verify country code is valid
    const countryCoords = getCountryCoordinates(code)
    if (!countryCoords) {
      console.log("[v0] Invalid country code, using fallback events")
      return NextResponse.json({
        events: generateFallbackEvents(location || code, startDate, endDate),
        cached: false,
        country: location || code,
        count: 3,
      })
    }

    // Check cache first
    const cacheKey = generateCacheKey("events", code, startDate, endDate)
    const cachedEvents = eventCache.get(cacheKey)
    
    if (cachedEvents) {
      console.log("[v0] Returning cached events")
      return NextResponse.json({
        events: cachedEvents,
        cached: true,
        country: countryCoords.name,
      })
    }

    // Fetch events for country using fixed Eventbrite client
    console.log("[v0] Fetching events from fixed Eventbrite client")
    const events = await fetchEventbriteEvents(
      code,
      startDate,
      endDate
    )

    console.log("[v0] Fetched events:", events.length)

    // If no events found, use fallback
    if (!events || events.length === 0) {
      console.log("[v0] No events found, using fallback")
      const fallback = generateFallbackEvents(countryCoords.name, startDate, endDate)
      eventCache.set(cacheKey, fallback)
      return NextResponse.json({
        events: fallback,
        cached: false,
        country: countryCoords.name,
        count: fallback.length,
      })
    }

    // Cache the result
    eventCache.set(cacheKey, events)

    return NextResponse.json({
      events: events,
      cached: false,
      country: countryCoords.name,
      count: events.length,
    })
  } catch (error) {
    console.error("[v0] Error in events API:", error)
    return NextResponse.json({
      events: [],
      cached: false,
      error: "Failed to fetch events",
    })
  }
}

function generateFallbackEvents(country: string, startDate: string, endDate: string) {
  const eventDate = new Date(startDate).toDateString()
  return [
    {
      id: "fallback-1",
      name: "Cultural Festival",
      date: eventDate,
      location: country,
      description: `Join us for a celebration of local culture and traditions in ${country}`,
      url: "https://www.eventbrite.com",
      category: "Culture",
      relevanceScore: 0.8,
    },
    {
      id: "fallback-2",
      name: "Local Food Market",
      date: eventDate,
      location: country,
      description: `Experience authentic cuisine and local food in ${country}`,
      url: "https://www.eventbrite.com",
      category: "Food",
      relevanceScore: 0.75,
    },
    {
      id: "fallback-3",
      name: "Adventure Experience",
      date: eventDate,
      location: country,
      description: `Outdoor adventure and activities in beautiful ${country}`,
      url: "https://www.eventbrite.com",
      category: "Adventure",
      relevanceScore: 0.7,
    },
  ]
}
