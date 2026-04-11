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

    const numImages = Math.max(3, Math.min(count, 20))

    // Cycle through discovery queries based on page
    const queryIndex = (page * 2) % DISCOVERY_QUERIES.length
    const selectedQueries = [
      DISCOVERY_QUERIES[queryIndex],
      DISCOVERY_QUERIES[(queryIndex + 1) % DISCOVERY_QUERIES.length],
    ]

    console.log("[v0] Discovering images:", { page, count: numImages, queries: selectedQueries })

    const imagePromises = selectedQueries.map(async (query) => {
      try {
        const results = await fetchPexelsImages(query)

        if (results && results.length > 0) {
          // Randomize which images we pick to vary results
          const shuffled = results.sort(() => Math.random() - 0.5)
          return shuffled.slice(0, Math.ceil(numImages / selectedQueries.length)).map((img) => ({
            url: img.image,
            tags: ["travel", "exploration"],
            mood: "inspirational",
            climate: "temperate",
            environment: "mixed",
            activity_level: "medium",
            food_style: "casual",
            category: "discovery",
          }))
        }

        return []
      } catch (error) {
        console.error("[v0] Error fetching from query:", query, error)
        return []
      }
    })

    const results = await Promise.all(imagePromises)
    const images = results.flat()

    console.log("[v0] Discovered images:", { page, count: images.length })

    return NextResponse.json({
      images,
      count: images.length,
      source: "pexels",
      page,
    })
  } catch (error) {
    console.error("[v0] Error in discover-images API:", error)
    return NextResponse.json(
      { error: "Failed to discover images", images: [] },
      { status: 500 }
    )
  }
}
