import { NextRequest, NextResponse } from "next/server"
import { fetchHotels, fetchRestaurants } from "@/lib/foursquare-client"
import { generateDestinationSummary, generateActivities } from "@/lib/gemini-client"
import { getDestinationNegatives, getHotelImage, getRestaurantImage, ensureNonEmpty } from "@/lib/destination-content-generator"
import { getDestinationImage, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { fetchEventsByCountry } from "@/lib/eventbrite-client"
import { generateSeed, selectRandomWithSeed, shuffleArrayWithSeed } from "@/lib/seed-randomizer"
import { generateDynamicHotels, generateDynamicRestaurants, generateDynamicActivities } from "@/lib/dynamic-data-generator"

// Force dynamic rendering - disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

interface DestinationRequest {
  countryCode: string
  countryName: string
  climate: string
  activities: string[]
  userPreferences: string[]
}

function getDefaultActivities(
  countryName: string,
  userPreferences: string[],
  seed: number
): Array<{ title: string; description: string; duration: string }> {
  // Use dynamic generator instead of static data
  return generateDynamicActivities(countryName, seed, 3)
}

  return (
    activityMap[countryName] || [
      {
        title: "Cultural Immersion",
        description: "Experience local culture, traditions, and way of life",
        duration: "Half day",
      },
      {
        title: "Natural Attractions",
        description: "Explore scenic landscapes and natural wonders",
        duration: "Full day",
      },
      {
        title: "Local Cuisine Experience",
        description: "Taste authentic local dishes and visit traditional restaurants",
        duration: "2-3 hours",
      },
    ]
  )
}

function getDefaultSummary(
  countryName: string,
  userPreferences: string[]
): {
  whyMatch: string
  pros: string[]
  cons: string[]
  bestFor: string
  recommendations: string[]
} {
  return {
    whyMatch: `${countryName} is a wonderful destination that matches your travel interests. With diverse experiences ranging from cultural landmarks to natural wonders, you'll find plenty to explore and enjoy.`,
    pros: [
      "Rich cultural heritage and historical sites",
      "Diverse natural landscapes and scenic beauty",
      "Excellent local cuisine and dining",
      "Warm and welcoming local community",
      "Well-developed tourism infrastructure",
    ],
    cons: ["Can be crowded during peak season", "Language barriers in some areas"],
    bestFor: "Travelers seeking a balance of culture, nature, and adventure",
    recommendations: [
      "Visit local markets for authentic souvenirs",
      "Try traditional local cuisine",
      "Hire a local guide for cultural insights",
      "Respect local customs and traditions",
      "Plan activities based on weather and season",
    ],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DestinationRequest & { seed?: number } = await request.json()
    const { countryCode, countryName, climate, activities, userPreferences, seed } = body

    // Generate or use provided seed for consistent randomization
    const requestSeed = seed || generateSeed()
    
    console.log("[v0] Fetching destination details for:", countryName, "with seed:", requestSeed)

    // Fetch hotels, restaurants, Gemini summary, activities, and events in parallel
    const [hotels, restaurants, geminiSummary, generatedActivities, destinationImg] = await Promise.allSettled([
      fetchHotels(countryCode, countryName, requestSeed),
      fetchRestaurants(countryCode, countryName, undefined, requestSeed),
      generateDestinationSummary(countryName, userPreferences, climate, activities),
      generateActivities(countryName, userPreferences, climate),
      getDestinationImage(countryName),
    ])

    // Use fulfilled values or generate fallbacks
    const hotelsList =
      hotels.status === "fulfilled" && hotels.value && hotels.value.length > 0
        ? hotels.value
        : []
    const restaurantsList =
      restaurants.status === "fulfilled" && restaurants.value && restaurants.value.length > 0
        ? restaurants.value
        : []
    
    // Use Gemini-generated activities if available, otherwise fallback
    const activitiesList = 
      generatedActivities.status === "fulfilled" && generatedActivities.value && generatedActivities.value.length > 0
        ? generatedActivities.value
        : getDefaultActivities(countryName, userPreferences, requestSeed)
    
    // Use Gemini summary if available, otherwise fallback
    const summaryData = 
      geminiSummary.status === "fulfilled" && geminiSummary.value
        ? geminiSummary.value
        : getDefaultSummary(countryName, userPreferences)
    
    // Get destination image
    const destinationImageUrl =
      destinationImg.status === "fulfilled" && destinationImg.value
        ? destinationImg.value
        : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"

    // Generate dynamic hotels, restaurants, and activities specific to this country
    const dynamicHotels = generateDynamicHotels(countryName, requestSeed, 5)
    const dynamicRestaurants = generateDynamicRestaurants(countryName, requestSeed, 5)

    // Ensure we have at least 3 items in each category - use dynamic generation as primary source
    const shuffledHotels = hotelsList.length > 0 ? hotelsList : dynamicHotels
    const shuffledRestaurants = restaurantsList.length > 0 ? restaurantsList : dynamicRestaurants
    const shuffledActivities = activitiesList.length > 0 ? activitiesList : getDefaultActivities(countryName, userPreferences, requestSeed)
    
    const finalHotels = shuffledArrayWithSeed(shuffledHotels, requestSeed).slice(0, 3)
    const finalRestaurants = shuffleArrayWithSeed(shuffledRestaurants, requestSeed).slice(0, 3)
    const finalActivities = shuffleArrayWithSeed(shuffledActivities, requestSeed).slice(0, 3)
    
    // Add images to hotels and restaurants
    const hotelsWithImages = finalHotels.map((h: any) => ({
      ...h,
      image: h.image || getHotelImage(h.price_level || "$$$"),
    }))

    const restaurantsWithImages = finalRestaurants.map((r: any) => ({
      ...r,
      image: r.image || getRestaurantImage(),
    }))

    // Get realistic negatives
    const negatives = getDestinationNegatives(countryName)

    const result = {
      seed: requestSeed,
      countryCode,
      countryName,
      hotels: hotelsWithImages,
      restaurants: restaurantsWithImages,
      activities: finalActivities,
      negatives,
      destinationImage: destinationImageUrl,
      summary: summaryData,
      flagUrl: getCountryFlagUrl(countryName),
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching destination details:", error)
    return NextResponse.json(
      { error: "Failed to fetch destination details" },
      { status: 500 }
    )
  }
}
