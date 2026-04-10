import { type NextRequest, NextResponse } from "next/server"
import { analyzePreferences, createPreferenceProfile } from "@/lib/preferences-analyzer"
import { getTopDestinations } from "@/lib/destination-matcher"
import { ImageMetadata } from "@/lib/image-generator"
import { generateSeed, shuffleArrayWithSeed } from "@/lib/seed-randomizer"

// Force dynamic rendering - disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageMetadata = [], language = "en", seed = null } = body

    // Generate fresh seed for this request
    const requestSeed = seed || generateSeed()
    
    console.log("[v0] Analyze request with seed:", requestSeed, {
      metadataCount: imageMetadata.length,
      language,
    })

    // Validate image metadata
    if (!Array.isArray(imageMetadata) || imageMetadata.length === 0) {
      return NextResponse.json(
        { error: "No image metadata provided" },
        { status: 400 }
      )
    }

    // Analyze user preferences from images
    const preferences = analyzePreferences(imageMetadata as ImageMetadata[])
    const profile = createPreferenceProfile(preferences)

    // Get top destination matches
    let topDestinations = getTopDestinations(profile, 10)
    
    // Shuffle results using seed to ensure different order each time
    topDestinations = shuffleArrayWithSeed(topDestinations, requestSeed)
    
    // Take only top 3 after shuffling
    topDestinations = topDestinations.slice(0, 3)

    // Ensure match percentages are in valid range (60-95%)
    const validatedDestinations = topDestinations.map((dest, index) => ({
      ...dest,
      confidenceScore: Math.max(60, Math.min(95, dest.confidenceScore + (index * 2)))
    }))

    // Format response with seed for client to send back
    const response = {
      requestSeed,
      userProfile: {
        dominantMood: profile.dominantMood,
        preferredClimate: profile.preferredClimate,
        preferredEnvironment: profile.preferredEnvironment,
        activityLevel: profile.activityLevel,
        foodPreferences: profile.foodPreferences,
      },
      countries: validatedDestinations.map((dest) => ({
        name: dest.countryName,
        code: dest.countryCode,
        matchPercentage: dest.confidenceScore,
        confidenceBreakdown: {
          activity: dest.scoreBreakdown.activityScore,
          climate: dest.scoreBreakdown.climateScore,
          mood: dest.scoreBreakdown.moodScore,
          food: dest.scoreBreakdown.foodScore,
        },
        positives: dest.positives,
        negatives: dest.negatives,
        climate: dest.climate,
        activities: dest.activities,
        foodHighlights: dest.foodHighlights,
        hotels: dest.hotels.map((h) => ({
          name: h.name,
          style: h.style,
          activity_level: h.activity_level,
        })),
      })),
      summary: generateSummary(validatedDestinations, profile, language),
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      }
    })
  } catch (error) {
    console.error("[v0] Error in analyze API:", error)
    return NextResponse.json(
      { error: "Failed to analyze preferences" },
      { status: 500 }
    )
  }
}

function generateSummary(destinations: any[], profile: any, language: string): string {
  const topDest = destinations[0]

  if (language === "fr") {
    return `Basé sur vos préférences visuelles, ${topDest.countryName} est votre destination idéale. Vous aimerez les activités ${profile.activityLevel} et le climat ${profile.preferredClimate}. Prévoyez plusieurs jours pour explorer pleinement cette destination magnifique.`
  } else if (language === "ar") {
    return `بناءً على تفضيلاتك البصرية، ${topDest.countryName} هي وجهتك المثالية. ستستمتع بالأنشطة ${profile.activityLevel} والمناخ ${profile.preferredClimate}. خطط لقضاء عدة أيام لاستكشاف هذه الوجهة الرائعة بالكامل.`
  }

  return `Based on your visual preferences, ${topDest.countryName} is perfectly matched for you. You'll love the ${profile.activityLevel} activities and ${profile.preferredClimate} climate. Plan for several days to fully explore this amazing destination.`
}
