/**
 * Generates unique images for different destination categories
 * Each category gets a different image with a unique prompt
 * No caching - always generates new images
 */

import { generateTravelImage } from "@/lib/replicate-generator"

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
    const prompt = getCategoryPrompt(destination, category)
    
    console.log(`[v0] CategoryImageGenerator: Generating ${category} image for ${destination}`)
    console.log(`[v0] CategoryImageGenerator: Using prompt: ${prompt}`)

    // Each image gets unique identifier to prevent caching
    const uniqueId = `${destination}-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const result = await generateTravelImage(uniqueId, prompt)
    
    if (result?.url) {
      console.log(`[v0] CategoryImageGenerator: ✓ Successfully generated ${category} image`)
      console.log(`[v0] CategoryImageGenerator: URL = ${result.url}`)
      return result.url
    }

    console.warn(`[v0] CategoryImageGenerator: ✗ Failed to generate ${category} image - returned null`)
    return null
  } catch (error) {
    console.error(`[v0] CategoryImageGenerator: Error generating ${category} image:`, error)
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
