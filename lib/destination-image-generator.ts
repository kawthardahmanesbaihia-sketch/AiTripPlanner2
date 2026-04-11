/**
 * Pexels-based destination image generator
 * Always returns fresh random images like Pexels feed
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

async function fetchPexelsImage(query: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80`,
      {
        headers: {
          Authorization: PEXELS_API_KEY || "",
        },
      }
    )

    const data = await res.json()

    if (data?.photos?.length > 0) {
      // 🔥 random image each time (important for "Pexels-like feel")
      const randomIndex = Math.floor(Math.random() * data.photos.length)
      return data.photos[randomIndex].src.large
    }
  } catch (error) {
    console.error("[Pexels] error:", error)
  }

  // fallback
  return "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg"
}

const COUNTRY_QUERY_MAP: Record<string, string> = {
  Japan: "Tokyo city night neon",
  Thailand: "Bangkok temple street market",
  "Costa Rica": "rainforest waterfall jungle",
  Greece: "Santorini white houses sea sunset",
  Morocco: "Marrakech market desert culture",
  Portugal: "Lisbon city streets ocean",
  "New Zealand": "mountains lake nature landscape",
  Brazil: "Rio de Janeiro beach city",
  Australia: "Sydney Opera House beach",
  Canada: "Canadian Rockies mountains lake",
  "United States": "New York skyline city night",
  France: "Paris Eiffel Tower street cafe",
  Spain: "Barcelona architecture beach city",
  Italy: "Rome Venice canals tuscany",
  Mexico: "Cancun beach ruins culture",
}

const imageCache = new Map<string, string>()

export async function getDestinationImage(countryName: string): Promise<string> {
  // ❌ cache disabled intentionally for "Pexels feel"
  // (you wanted new images every refresh)

  const query =
    COUNTRY_QUERY_MAP[countryName] ||
    `${countryName} travel landscape city nature`

  return await fetchPexelsImage(query)
}

export function getCountryCode(countryName: string): string {
  return "xx"
}

export function getCountryFlagUrl(countryName: string): string {
  return `https://flagsapi.com/XX/flat/64.png`
}