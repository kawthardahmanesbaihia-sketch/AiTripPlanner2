export interface ImageMetadata {
  url: string
  tags: string[]
  mood: string
  climate: string[]
  environment: string
  subtheme: string // NEW: Enforces uniqueness
  activity_level: string
  budget_level: string // NEW: For better matching
  vibe: string // NEW: adventure, relax, culture, party
  crowd_level: string // NEW: For preference matching
  food_style?: string
  category: string
}

// STRICT DIVERSITY: Each category has distinct sub-themes
export const CURATED_IMAGES: Record<string, ImageMetadata[]> = {
  nature: [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      tags: ["mountain", "snow", "peak", "alpine", "adventure", "cold", "skiing"],
      mood: "majestic",
      climate: ["cold"],
      environment: "mountain",
      subtheme: "snowy_mountain",
      activity_level: "high",
      budget_level: "high",
      vibe: "adventure",
      crowd_level: "low",
      category: "nature",
    },
    {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
      tags: ["mountain", "green", "valley", "hiking", "scenic", "lush", "forest"],
      mood: "peaceful",
      climate: ["mild"],
      environment: "mountain",
      subtheme: "green_mountain",
      activity_level: "medium",
      budget_level: "medium",
      vibe: "adventure",
      crowd_level: "low",
      category: "nature",
    },
    {
      url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
      tags: ["beach", "ocean", "tropical", "paradise", "relaxation", "sand", "coast"],
      mood: "peaceful",
      climate: ["hot", "tropical"],
      environment: "beach",
      subtheme: "beach",
      activity_level: "low",
      budget_level: "medium",
      vibe: "relax",
      crowd_level: "medium",
      category: "nature",
    },
    {
      url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop",
      tags: ["lake", "water", "mountains", "scenic", "peaceful", "reflection", "calm"],
      mood: "tranquil",
      climate: ["mild"],
      environment: "lake",
      subtheme: "lake",
      activity_level: "low",
      budget_level: "low",
      vibe: "relax",
      crowd_level: "low",
      category: "nature",
    },
    {
      url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop",
      tags: ["desert", "sand", "dunes", "exotic", "adventure", "arid", "hot"],
      mood: "mysterious",
      climate: ["hot"],
      environment: "desert",
      subtheme: "desert",
      activity_level: "medium",
      budget_level: "medium",
      vibe: "adventure",
      crowd_level: "low",
      category: "nature",
    },
    {
      url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&h=400&fit=crop",
      tags: ["waterfall", "nature", "water", "lush", "adventure", "tropical", "cascade"],
      mood: "energetic",
      climate: ["tropical", "mild"],
      environment: "forest",
      subtheme: "waterfall",
      activity_level: "medium",
      budget_level: "low",
      vibe: "adventure",
      crowd_level: "low",
      category: "nature",
    },
  ],
  city: [
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
      tags: ["modern", "city", "skyline", "urban", "architecture", "skyscraper", "business"],
      mood: "vibrant",
      climate: ["any"],
      environment: "urban",
      subtheme: "modern_city",
      activity_level: "medium",
      budget_level: "high",
      vibe: "culture",
      crowd_level: "high",
      category: "city",
    },
    {
      url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop",
      tags: ["classic", "historic", "architecture", "old", "culture", "heritage", "monument"],
      mood: "elegant",
      climate: ["any"],
      environment: "urban",
      subtheme: "historical_city",
      activity_level: "low",
      budget_level: "medium",
      vibe: "culture",
      crowd_level: "medium",
      category: "city",
    },
    {
      url: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600&h=400&fit=crop",
      tags: ["coastal", "harbor", "city", "ocean", "port", "waterfront", "seaside"],
      mood: "refreshing",
      climate: ["mild", "hot"],
      environment: "coastal",
      subtheme: "coastal_city",
      activity_level: "medium",
      budget_level: "medium",
      vibe: "relax",
      crowd_level: "medium",
      category: "city",
    },
    {
      url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
      tags: ["traditional", "old town", "historic", "culture", "charming", "cobblestone", "medieval"],
      mood: "nostalgic",
      climate: ["any"],
      environment: "urban",
      subtheme: "old_town",
      activity_level: "low",
      budget_level: "low",
      vibe: "culture",
      crowd_level: "medium",
      category: "city",
    },
    {
      url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop",
      tags: ["futuristic", "technology", "modern", "innovative", "urban", "sleek", "digital"],
      mood: "exciting",
      climate: ["any"],
      environment: "urban",
      subtheme: "futuristic_city",
      activity_level: "medium",
      budget_level: "high",
      vibe: "culture",
      crowd_level: "high",
      category: "city",
    },
    {
      url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=400&fit=crop",
      tags: ["nightlife", "city", "lights", "evening", "vibrant", "entertainment", "party"],
      mood: "energetic",
      climate: ["any"],
      environment: "urban",
      subtheme: "nightlife_city",
      activity_level: "high",
      budget_level: "medium",
      vibe: "party",
      crowd_level: "high",
      category: "city",
    },
  ],
  activities: [
    {
      url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop",
      tags: ["hiking", "trail", "mountains", "outdoor", "adventure", "nature", "trekking"],
      mood: "adventurous",
      climate: ["mild", "cold"],
      environment: "nature",
      subtheme: "adventure",
      activity_level: "high",
      budget_level: "low",
      vibe: "adventure",
      crowd_level: "low",
      category: "activities",
    },
    {
      url: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=400&fit=crop",
      tags: ["cultural", "museum", "art", "history", "indoor", "education", "heritage"],
      mood: "enriching",
      climate: ["any"],
      environment: "urban",
      subtheme: "cultural",
      activity_level: "low",
      budget_level: "medium",
      vibe: "culture",
      crowd_level: "medium",
      category: "activities",
    },
    {
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop",
      tags: ["spa", "relaxation", "wellness", "massage", "luxury", "peaceful", "rejuvenation"],
      mood: "relaxing",
      climate: ["any"],
      environment: "indoor",
      subtheme: "relaxation",
      activity_level: "low",
      budget_level: "high",
      vibe: "relax",
      crowd_level: "low",
      category: "activities",
    },
    {
      url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
      tags: ["festival", "crowd", "celebration", "culture", "event", "party", "music"],
      mood: "joyful",
      climate: ["any"],
      environment: "mixed",
      subtheme: "nightlife",
      activity_level: "medium",
      budget_level: "medium",
      vibe: "party",
      crowd_level: "high",
      category: "activities",
    },
    {
      url: "https://images.unsplash.com/photo-1502933691298-834f871fd851?w=600&h=400&fit=crop",
      tags: ["surfing", "water", "sport", "ocean", "beach", "active", "adventure"],
      mood: "exciting",
      climate: ["hot", "tropical"],
      environment: "beach",
      subtheme: "nature_activity",
      activity_level: "high",
      budget_level: "medium",
      vibe: "adventure",
      crowd_level: "medium",
      category: "activities",
    },
    {
      url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop",
      tags: ["climbing", "rock", "adventure", "extreme", "challenge", "sport", "outdoor"],
      mood: "thrilling",
      climate: ["any"],
      environment: "nature",
      subtheme: "extreme",
      activity_level: "high",
      budget_level: "medium",
      vibe: "adventure",
      crowd_level: "low",
      category: "activities",
    },
  ],
  food: [
    {
      url: "https://images.unsplash.com/photo-155593959458d7cb561ad1?w=600&h=400&fit=crop",
      tags: ["street food", "market", "food", "local", "authentic", "casual", "vendor"],
      mood: "vibrant",
      climate: ["any"],
      environment: "outdoor",
      subtheme: "street_food",
      activity_level: "low",
      budget_level: "low",
      vibe: "culture",
      crowd_level: "high",
      food_style: "casual",
      category: "food",
    },
    {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
      tags: ["traditional", "food", "culture", "authentic", "local", "heritage", "homemade"],
      mood: "authentic",
      climate: ["any"],
      environment: "mixed",
      subtheme: "traditional_food",
      activity_level: "low",
      budget_level: "medium",
      vibe: "culture",
      crowd_level: "medium",
      food_style: "traditional",
      category: "food",
    },
    {
      url: "https://images.unsplash.com/photo-155933935211d035aa65de?w=600&h=400&fit=crop",
      tags: ["seafood", "fish", "ocean", "fresh", "coastal", "delicious", "catch"],
      mood: "fresh",
      climate: ["coastal"],
      environment: "coastal",
      subtheme: "seafood",
      activity_level: "low",
      budget_level: "medium",
      vibe: "relax",
      crowd_level: "medium",
      food_style: "seafood",
      category: "food",
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      tags: ["fine dining", "restaurant", "gourmet", "elegant", "luxury", "upscale", "michelin"],
      mood: "sophisticated",
      climate: ["any"],
      environment: "indoor",
      subtheme: "fine_dining",
      activity_level: "low",
      budget_level: "high",
      vibe: "culture",
      crowd_level: "low",
      food_style: "fine_dining",
      category: "food",
    },
    {
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      tags: ["cafe", "coffee", "dessert", "pastry", "cozy", "relaxing", "sweet"],
      mood: "cozy",
      climate: ["any"],
      environment: "indoor",
      subtheme: "cafe",
      activity_level: "low",
      budget_level: "low",
      vibe: "relax",
      crowd_level: "low",
      food_style: "cafe",
      category: "food",
    },
    {
      url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
      tags: ["bbq", "grilled", "meat", "food", "hearty", "outdoor", "smoky"],
      mood: "satisfying",
      climate: ["any"],
      environment: "outdoor",
      subtheme: "bbq",
      activity_level: "low",
      budget_level: "medium",
      vibe: "relax",
      crowd_level: "medium",
      food_style: "bbq",
      category: "food",
    },
  ],
}

export function getCuratedImages(category: string, count = 6, sessionSeed = 0): ImageMetadata[] {
  const categoryImages = CURATED_IMAGES[category.toLowerCase()] || []

  if (categoryImages.length === 0) {
    return []
  }

  const timestamp = Date.now()
  const rotationSeed = Math.floor(timestamp / 10000) + sessionSeed

  const subthemeMap = new Map<string, ImageMetadata>()

  const shuffled = [...categoryImages].sort((a, b) => {
    const hashA = (a.subtheme.charCodeAt(0) + rotationSeed) % 1000
    const hashB = (b.subtheme.charCodeAt(0) + rotationSeed) % 1000
    return hashA - hashB
  })

  for (const img of shuffled) {
    if (!subthemeMap.has(img.subtheme)) {
      subthemeMap.set(img.subtheme, img)
    }
  }

  const diverseImages = Array.from(subthemeMap.values()).slice(0, count)

  return diverseImages
}

export function getRotatedImages(category: string, count = 6, previousUrls: string[] = []): ImageMetadata[] {
  const sessionSeed = previousUrls.length > 0 ? previousUrls.length * 13 : 0
  const images = getCuratedImages(category, count + 3, sessionSeed) // Get extra for filtering

  const filtered = images.filter((img) => {
    const baseUrl = img.url.split("&t=")[0]
    return !previousUrls.some((prev) => prev.split("&t=")[0] === baseUrl)
  })

  return filtered.slice(0, count)
}
