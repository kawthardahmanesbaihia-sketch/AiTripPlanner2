/**
 * Generates realistic destination content with guaranteed fallbacks
 * All content is dynamic and always has fallback options
 */

export interface DestinationContent {
  negatives: string[]
  hotelImages: string[]
  restaurantImages: string[]
  eventImages: string[]
}

// Generic fallback negatives when destination-specific ones aren't available
const GENERIC_NEGATIVES = [
  "May have language barriers in some areas",
  "Can be crowded during peak tourist seasons",
  "Infrastructure and services vary by region",
  "Currency exchange rates may not be favorable",
  "Limited public transportation in remote areas",
]

const DESTINATION_NEGATIVES: Record<string, string[]> = {
  Japan: [
    "High cost of living and accommodations",
    "Language barrier in rural areas",
    "Extremely crowded during peak seasons",
    "Complex public transportation system",
    "Expensive dining and attractions",
  ],
  Thailand: [
    "Very hot and humid weather year-round",
    "Traffic congestion in Bangkok",
    "Scams targeting tourists in popular areas",
    "Language barrier outside tourist zones",
    "Monsoon season brings heavy rainfall",
  ],
  "Costa Rica": [
    "High tourism costs despite being developing country",
    "Limited public transportation outside main areas",
    "Rainy season can limit outdoor activities",
    "Roads can be poorly maintained",
    "Healthcare standards below developed countries",
  ],
  Greece: [
    "Island hopping is time-consuming and expensive",
    "Peak summer season is extremely crowded",
    "Limited nightlife outside major cities",
    "Intermittent public transportation",
    "Many attractions close in winter",
  ],
  Morocco: [
    "Aggressive vendors in medinas",
    "Language barrier (French/Arabic primary)",
    "Female travelers may face harassment",
    "Limited infrastructure in rural areas",
    "Extreme heat in desert regions",
  ],
  Portugal: [
    "Limited English in smaller towns",
    "Summer crowds in popular destinations",
    "Accommodation fills quickly in peak season",
    "Some areas lack modern infrastructure",
    "Atlantic coast can be cold",
  ],
  "New Zealand": [
    "Extremely high accommodation costs",
    "Long driving distances between attractions",
    "Limited public transportation",
    "Unpredictable weather conditions",
    "Jet lag from remote location",
  ],
  Brazil: [
    "High crime rates in major cities",
    "Language barrier (Portuguese primary)",
    "Infrastructure challenges outside major cities",
    "Mosquitoes and tropical diseases",
    "Expensive for South American destination",
  ],
  Australia: [
    "Very long distances between attractions",
    "Expensive flights from international locations",
    "Dangerous wildlife and marine creatures",
    "Harsh sun exposure risks",
    "Limited public transportation outside cities",
  ],
  Canada: [
    "Extremely cold winters in most regions",
    "Expensive accommodation and dining",
    "Long distances between major attractions",
    "Limited tourism infrastructure in remote areas",
    "Peak season is very crowded",
  ],
  "United States": [
    "Expensive compared to many destinations",
    "Vast distances between attractions",
    "Sporadic public transportation",
    "Visa requirements for many nationalities",
    "Healthcare costs extremely high",
  ],
  France: [
    "Peak season tourism is overwhelming",
    "Limited English outside Paris",
    "Service can be slow in cafes",
    "Pickpocketing common in tourist areas",
    "Expensive, especially in Paris",
  ],
}

export function getDestinationNegatives(countryName: string): string[] {
  const negatives = DESTINATION_NEGATIVES[countryName] || GENERIC_NEGATIVES
  if (!negatives || negatives.length === 0) {
    return GENERIC_NEGATIVES
  }
  
  // Return 2-3 negatives, always non-empty
  const shuffled = [...negatives].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2)
}

const HOTEL_PLACEHOLDER_IMAGES: Record<string, string[]> = {
  luxury: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
    "https://images.unsplash.com/photo-1615874959375-5d2c4f3dba17?w=400&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  ],
  boutique: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    "https://images.unsplash.com/photo-1590073876895-61e2f8d61eeb?w=400&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
  ],
  budget: [
    "https://images.unsplash.com/photo-1563288900-9b1e1097c14f?w=400&q=80",
    "https://images.unsplash.com/photo-1591345572406-1a7003c4bc5a?w=400&q=80",
    "https://images.unsplash.com/photo-1563288900-9b1e1097c14f?w=400&q=80",
  ],
}

export function getHotelImage(priceLevel: string): string {
  const level = priceLevel.toLowerCase().includes("$$$$") ? "luxury" : 
                priceLevel.toLowerCase().includes("$$$") ? "boutique" : "budget"
  const images = HOTEL_PLACEHOLDER_IMAGES[level]
  return images[Math.floor(Math.random() * images.length)]
}

const RESTAURANT_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1504674900967-a8126e4c6555?w=400&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1495023350881-cdbca0b45d64?w=400&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  "https://images.unsplash.com/photo-1430705046352-d4e6a9d0d0e6?w=400&q=80",
]

export function getRestaurantImage(): string {
  return RESTAURANT_IMAGES[Math.floor(Math.random() * RESTAURANT_IMAGES.length)]
}

const EVENT_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
  "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80",
  "https://images.unsplash.com/photo-1533909752211-118fccc99b67?w=400&q=80",
  "https://images.unsplash.com/photo-1519671482677-11fbb972b814?w=400&q=80",
]

export function getEventImage(category: string): string {
  // For now, return random event image - could be customized by category
  return EVENT_IMAGES[Math.floor(Math.random() * EVENT_IMAGES.length)]
}

export function ensureNonEmpty<T>(items: T[], fallback: T[], minCount: number = 3): T[] {
  if (!items || items.length === 0) {
    return fallback.slice(0, minCount)
  }
  if (items.length < minCount) {
    return [...items, ...fallback.slice(0, minCount - items.length)]
  }
  return items
}
