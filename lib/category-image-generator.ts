/**
 * Generates unique images for different destination categories
 * Each category gets a different image with a unique prompt
 * No caching - always generates new images
 */

import { fetchPexelsImages } from "@/lib/pexels"

export type ImageCategory = "city" | "nature" | "activities" | "events" | "restaurants" | "hotels"

/**
 * Generate category-specific prompts based on destination
 */
function getCategoryPrompt(destination: string, category: ImageCategory): string {
  const basePrompts: Record<ImageCategory, string> = {
    city: `${destination} cityscape, iconic landmarks, urban architecture, street life, sunset lighting, ultra realistic travel photography, 4K`,
    nature: `Beautiful ${destination} nature, landscapes, mountains, forests, water views, scenic beauty, cinematic photography, outdoor adventure`,
    activities: `Tourist enjoying activities in ${destination}, outdoor recreation, adventure sports, lifestyle photography, happy travelers, realistic 4K`,
    events: `Vibrant festival or event in ${destination}, crowds, celebrations, night lights, entertainment, lively atmosphere, professional photography`,
    restaurants: `Authentic ${destination} cuisine, restaurant dining, gourmet food presentation, local dishes, fine dining, delicious food photography`,
    hotels: `Luxury hotel in ${destination}, elegant accommodation, resort amenities, beautiful interior design, hospitality, premium travel experience`,
  }
  
  return basePrompts[category] || basePrompts.city
}

/**
 * Generate a unique image for a specific category
 * Each call generates a new image - no caching
 * NO REUSING IMAGES - always generate fresh
 */
export async function generateCategoryImage(
  destination: string,
  category: ImageCategory
): Promise<string | null> {
  try {
    const queryMap: Record<ImageCategory, string> = {
      city: `${destination} city skyline`,
      nature: `${destination} nature landscape`,
      activities: `${destination} activities travel`,
      events: `${destination} festival events`,
      restaurants: `${destination} food restaurant`,
      hotels: `${destination} luxury hotel`,
    }

    const query = queryMap[category] || `${destination} travel`

    const images = await fetchPexelsImages(query)

    if (images.length > 0) {
      return images[0].image
    }

    return null
  } catch (error) {
    console.error("[Pexels] Error:", error)
    return null
  }
}

/**
 * Generate all category images for a destination
 * Returns object with image URL for each category
 * Each image is generated independently - NO SHARING
 */
export async function generateAllCategoryImages(
  destination: string
): Promise<Record<ImageCategory, string | null>> {
  const categories: ImageCategory[] = ["city", "nature", "activities", "events", "restaurants", "hotels"]
  
  console.log(`[v0] CategoryImageGenerator: Generating ALL category images for ${destination}`)
  console.log(`[v0] CategoryImageGenerator: Categories to generate: ${categories.join(", ")}`)
  
  const results = await Promise.allSettled(
    categories.map(cat => {
      console.log(`[v0] CategoryImageGenerator: Queuing ${cat} image generation...`)
      return generateCategoryImage(destination, cat)
    })
  )

  const imageMap: Record<ImageCategory, string | null> = {
    city: null,
    nature: null,
    activities: null,
    events: null,
    restaurants: null,
    hotels: null,
  }

  results.forEach((result, index) => {
    const category = categories[index]
    if (result.status === "fulfilled" && result.value) {
      imageMap[category] = result.value
      console.log(`[v0] CategoryImageGenerator: ✓ ${category} = ${result.value}`)
    } else if (result.status === "rejected") {
      console.error(`[v0] CategoryImageGenerator: ✗ ${category} generation rejected:`, result.reason)
    } else {
      console.warn(`[v0] CategoryImageGenerator: ✗ ${category} generation returned null`)
    }
  })

  console.log(`[v0] CategoryImageGenerator: Completed all image generation for ${destination}`)
  return imageMap
}
