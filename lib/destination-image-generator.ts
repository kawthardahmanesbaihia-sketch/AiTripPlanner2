/**
 * Generates AI-powered destination images using Replicate API
 * Creates unique, realistic travel images for each destination
 */

import { generateTravelImage } from "@/lib/replicate-generator"

const COUNTRY_CODE_MAP: Record<string, string> = {
  Japan: "jp",
  Thailand: "th",
  "Costa Rica": "cr",
  Greece: "gr",
  Morocco: "ma",
  Portugal: "pt",
  "New Zealand": "nz",
  Brazil: "br",
  Australia: "au",
  Canada: "ca",
  "United States": "us",
  France: "fr",
  Spain: "es",
  Italy: "it",
  Mexico: "mx",
  Germany: "de",
  Netherlands: "nl",
  Switzerland: "ch",
  Austria: "at",
  Belgium: "be",
  Denmark: "dk",
  Norway: "no",
  Sweden: "se",
  Finland: "fi",
  Poland: "pl",
  Hungary: "hu",
  Czech: "cz",
  Romania: "ro",
  Bulgaria: "bg",
  Croatia: "hr",
  Serbia: "rs",
  Turkey: "tr",
  Egypt: "eg",
  "South Africa": "za",
  Kenya: "ke",
  India: "in",
  Pakistan: "pk",
  Bangladesh: "bd",
  "Sri Lanka": "lk",
  Vietnam: "vn",
  Cambodia: "kh",
  Laos: "la",
  Myanmar: "mm",
  Malaysia: "my",
  Singapore: "sg",
  Indonesia: "id",
  Philippines: "ph",
  Taiwan: "tw",
  "South Korea": "kr",
  China: "cn",
  "Hong Kong": "hk",
}

const DESTINATION_PROMPTS: Record<string, string> = {
  Japan: "Beautiful Tokyo cityscape with neon lights and traditional temples, Mount Fuji in background, cinematic travel photography, ultra 4K",
  Thailand: "Stunning Bangkok temples with golden spires, Phuket tropical beaches, vibrant street markets, Thai culture, professional travel photography",
  "Costa Rica": "Lush Costa Rica rainforest with waterfalls, Arenal volcano, tropical wildlife, adventure landscape, cinematic photography",
  Greece: "Iconic Santorini white buildings with blue domes, sunset views, Mediterranean sea, beautiful coastal landscape, travel photography",
  Morocco: "Exotic Morocco medina marketplace, Atlas Mountains, Sahara desert, traditional culture, cinematic travel photography",
  Portugal: "Beautiful Lisbon cityscape, Douro Valley vineyards, coastal cliffs, European charm, professional travel photography",
  "New Zealand": "Stunning New Zealand fjords, Milford Sound, mountain scenery, adventure landscape, cinematic nature photography",
  Brazil: "Vibrant Rio de Janeiro with Christ the Redeemer, Amazon rainforest, Copacabana beach, Brazilian culture, travel photography",
  Australia: "Iconic Uluru sunset, Great Barrier Reef, Sydney Opera House, Australian outback, stunning nature photography",
  Canada: "Beautiful Canadian Rockies, Banff Lake Louise, Niagara Falls, mountain landscape, cinematic photography",
  "United States": "New York City skyline, Grand Canyon, Las Vegas lights, American landmarks, diverse landscape photography",
  France: "Romantic Eiffel Tower Paris, Provence lavender fields, French Riviera, European elegance, professional travel photography",
  Spain: "Beautiful Barcelona architecture, Sagrada Familia, Mediterranean beaches, Spanish culture, travel photography",
  Italy: "Iconic Venice canals, Colosseum Rome, Tuscan countryside, Italian culture, cinematic travel photography",
  Mexico: "Vibrant Mexico City, Cancun beaches, ancient Mayan ruins, Mexican culture, colorful travel photography",
}

// Cache for generated images to avoid regenerating
const imageCache: Map<string, string> = new Map()

export async function getDestinationImage(countryName: string): Promise<string> {
  // Check cache first
  if (imageCache.has(countryName)) {
    return imageCache.get(countryName)!
  }

  const prompt = DESTINATION_PROMPTS[countryName] || `Beautiful ${countryName} landscape, travel destination, professional photography, 4K`

  try {
    const generatedImage = await generateTravelImage(countryName, prompt)
    if (generatedImage?.url) {
      imageCache.set(countryName, generatedImage.url)
      return generatedImage.url
    }
  } catch (error) {
    console.error("[v0] Error generating image for", countryName, error)
  }

  // Fallback to generic travel image if generation fails
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
}

export function getCountryCode(countryName: string): string {
  return COUNTRY_CODE_MAP[countryName] || "xx"
}

export function getCountryFlagUrl(countryName: string): string {
  const code = getCountryCode(countryName)
  return `https://flagsapi.com/${code.toUpperCase()}/flat/64.png`
}
