import { fetchPexelsImages } from "@/lib/pexels"
import { type NextRequest, NextResponse } from "next/server"

// Travel inspiration search queries - pure discovery, no categories
const DISCOVERY_QUERIES = [
  "travel destination landscape",
  "adventure outdoor",
  "beach vacation",
  "mountain hiking",
  "city exploration",
  "cultural site",
  "nature scenery",
  "hidden gem location",
  "food travel cuisine",
  "local market",
  "waterfall nature",
  "sunset view",
  "ancient temple",
  "tropical island",
  "desert landscape",
  "forest trail",
  "coastal view",
  "village street",
  "night lights city",
  "adventure activity",
]

export async function POST(request: NextRequest) {
  try {
    const { page = 0, count = 12 } = await request.json()

    // Cycle through queries based on page
    const queryIndex = page % DISCOVERY_QUERIES.length
    const query = DISCOVERY_QUERIES[queryIndex]

    // Fetch from Pexels API
    const images = await fetchPexelsImages(query, page, count)

    // Map to our format - no categories, just discovery
    const mappedImages = images.map((img: any) => ({
      url: img.src.large,
      source: "ai" as const,
      tags: query.split(" "),
      mood: "neutral",
      climate: "temperate",
      environment: "outdoor",
      activity_level: "medium",
      food_style: "casual",
      category: "discovery",
    }))

    return NextResponse.json({ images: mappedImages })
  } catch (error) {
    console.error("[v0] Error fetching discovery images:", error)
    return NextResponse.json({ images: [], error: "Failed to fetch images" }, { status: 500 })
  }
}
