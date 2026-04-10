/**
 * Dynamic Data Generator
 * Generates unique, destination-specific content without relying on static fallbacks
 */

export interface DynamicHotel {
  name: string
  rating: number
  location: string
  category: string
  price_level: string
  image?: string
  style: string
  activity_level: string
}

export interface DynamicRestaurant {
  name: string
  rating: number
  cuisine: string
  location: string
  category: string
  image?: string
}

export interface DynamicActivity {
  title: string
  description: string
  duration: string
}

// Country-specific data templates for dynamic generation
const COUNTRY_DATA: Record<string, {
  hotelStyles: string[]
  hotelNames: string[]
  hotelCities: string[]
  cuisines: string[]
  restaurantNames: string[]
  restaurantCities: string[]
  activityTypes: string[]
  activityDescriptions: Record<string, string[]>
  majorcities: string[]
}> = {
  "United States": {
    hotelStyles: ["Modern Boutique", "Historic Luxury", "Contemporary Urban", "Luxury Resort", "Chic Downtown"],
    hotelNames: ["The Grand", "Plaza Hotel", "Metropolitan", "Presidio", "Pinnacle", "The Landmark", "Renaissance"],
    hotelCities: ["New York", "Los Angeles", "San Francisco", "Miami", "Chicago", "Boston", "Seattle"],
    cuisines: ["American", "Italian", "French", "Mexican", "Asian Fusion", "Southern BBQ", "Steakhouse"],
    restaurantNames: ["Harvest", "The Kitchen", "Cornerstone", "Prime", "Local Table", "Artisan", "Heritage"],
    restaurantCities: ["New York", "Los Angeles", "San Francisco", "Chicago", "Austin", "New Orleans"],
    activityTypes: ["City Tour", "National Park", "Museum", "Beach", "Hiking", "Historical Site"],
    activityDescriptions: {
      "City Tour": ["Explore vibrant neighborhoods and iconic landmarks", "Walking tour through historic districts", "Guided city sightseeing adventure"],
      "National Park": ["Scenic hiking with stunning vistas", "Nature exploration and wildlife viewing", "Outdoor adventure in protected wilderness"],
      "Museum": ["Art and culture immersion experience", "Historical exhibits and collections", "Interactive museum exploration"],
    },
    majorcities: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
  },
  "Japan": {
    hotelStyles: ["Traditional Ryokan", "Modern Luxury", "Capsule Hotel", "Business Hotel", "Resort"],
    hotelNames: ["Park Hyatt", "Four Seasons", "Aman", "Ritz-Carlton", "Mandarin Oriental", "Peninsula", "Okura"],
    hotelCities: ["Tokyo", "Kyoto", "Osaka", "Yokohama", "Nara", "Hiroshima"],
    cuisines: ["Sushi", "Ramen", "Tempura", "Yakitori", "Kaiseki", "Okonomiyaki", "Tonkatsu"],
    restaurantNames: ["Jiro", "Ichiran", "Ippudo", "Gonpachi", "Kiji", "Mizuki", "Sakura"],
    restaurantCities: ["Tokyo", "Kyoto", "Osaka", "Fukuoka", "Hiroshima"],
    activityTypes: ["Temple Visit", "Shrine Tour", "Zen Garden", "Tea Ceremony", "Cherry Blossoms", "Martial Arts"],
    activityDescriptions: {
      "Temple Visit": ["Explore ancient Buddhist temples", "Sacred shrine pilgrimage experience", "Traditional temple architecture tour"],
      "Zen Garden": ["Meditative garden exploration", "Zen philosophy and landscaping tour", "Peaceful garden sanctuary visit"],
      "Cherry Blossoms": ["Spring blossom viewing festival", "Cherry tree park exploration", "Hanami celebration experience"],
    },
    majorcities: ["Tokyo", "Kyoto", "Osaka", "Hiroshima", "Nara"],
  },
  "Thailand": {
    hotelStyles: ["Luxury Resort", "Beachfront Villa", "Urban Boutique", "Temple Retreat", "Adventure Lodge"],
    hotelNames: ["Mandarin Oriental", "Four Seasons", "Banyan Tree", "Amanpuri", "Centara", "Intercontinental"],
    hotelCities: ["Bangkok", "Phuket", "Chiang Mai", "Krabi", "Pattaya", "Samui"],
    cuisines: ["Thai", "Pad Thai", "Tom Yum", "Green Curry", "Street Food", "Fusion"],
    restaurantNames: ["Gaggan", "Som Tam Conti", "Nahm", "Baan Khanitha", "Issaya Siamese"],
    restaurantCities: ["Bangkok", "Phuket", "Chiang Mai", "Krabi"],
    activityTypes: ["Temple", "Elephant Sanctuary", "Island Hopping", "Muay Thai", "Night Market", "Diving"],
    activityDescriptions: {
      "Temple": ["Grand Palace and temple complex tour", "Buddhist monastery visit and blessings", "Ancient temple architecture exploration"],
      "Elephant Sanctuary": ["Ethical elephant interaction program", "Jungle sanctuary nature walk", "Elephant care and feeding experience"],
      "Island Hopping": ["Tropical island exploration by speedboat", "Coral reef diving adventure", "Beach and lagoon tour"],
    },
    majorcities: ["Bangkok", "Phuket", "Chiang Mai", "Krabi", "Samui"],
  },
  "France": {
    hotelStyles: ["Luxury Boutique", "Historic Manor", "Contemporary Parisian", "Chateau", "Riviera Resort"],
    hotelNames: ["Ritz-Carlton", "Costes", "Le Bristol", "Four Seasons", "Plaza Athenee", "Crillon"],
    hotelCities: ["Paris", "Lyon", "Nice", "Marseille", "Bordeaux", "Cannes"],
    cuisines: ["French", "Haute Cuisine", "Bistro", "Provence", "Seafood", "Wine Pairing"],
    restaurantNames: ["Le Jules Verne", "Alain Ducasse", "Arpege", "Lutece", "Lasserre", "Joël Robuchon"],
    restaurantCities: ["Paris", "Lyon", "Nice", "Marseille", "Bordeaux"],
    activityTypes: ["Museum", "Wine Tasting", "Palace Tour", "Cafe Culture", "Beach", "Art Gallery"],
    activityDescriptions: {
      "Museum": ["Louvre museum masterpiece tour", "Impressionist art collection visit", "Modern art gallery exploration"],
      "Wine Tasting": ["Vineyard tour and wine education", "Local wine bar tasting experience", "Château wine cellar tour"],
      "Palace Tour": ["Versailles Palace grandeur exploration", "Loire Valley castle tour", "Historic royal residence visit"],
    },
    majorcities: ["Paris", "Lyon", "Nice", "Marseille", "Bordeaux"],
  },
  "Spain": {
    hotelStyles: ["Andalusian Riad", "Beachfront Luxury", "Barcelona Modern", "Rural Hacienda", "Urban Boutique"],
    hotelNames: ["Mandarin Oriental", "Gran Via", "Mercer", "Urban", "Palacio", "Neri"],
    hotelCities: ["Barcelona", "Madrid", "Seville", "Valencia", "Granada", "Malaga"],
    cuisines: ["Spanish", "Paella", "Tapas", "Gazpacho", "Seafood", "Jamón"],
    restaurantNames: ["El Bulli", "Casa Botín", "La Boqueria", "Casa Lucio", "Tickets"],
    restaurantCities: ["Barcelona", "Madrid", "Seville", "Valencia"],
    activityTypes: ["Flamenco Dance", "Museum", "Beach", "Architecture Tour", "Market Tour", "Tapas Bar"],
    activityDescriptions: {
      "Flamenco Dance": ["Live flamenco performance evening", "Flamenco dance lesson and show", "Traditional flamenco nightclub experience"],
      "Architecture Tour": ["Gaudi architectural wonders tour", "Sagrada Familia exploration", "Gothic quarter walking tour"],
      "Market Tour": ["La Rambla street market experience", "Local market food and culture tour", "Traditional bazaar shopping"],
    },
    majorcities: ["Barcelona", "Madrid", "Seville", "Valencia", "Granada"],
  },
  "Italy": {
    hotelStyles: ["Venetian Palace", "Tuscan Villa", "Amalfi Luxury", "Roman Historic", "Riviera Resort"],
    hotelNames: ["Gritti Palace", "Cipriani", "Danieli", "Hassler", "Aman", "Belmond"],
    hotelCities: ["Venice", "Rome", "Florence", "Amalfi", "Milan", "Bologna"],
    cuisines: ["Italian", "Pasta", "Risotto", "Seafood", "Tuscan", "Sicilian"],
    restaurantNames: ["Osteria dell'Eremita", "Trattoria da Valentino", "Al Covo", "Enoteca Pinchiorri"],
    restaurantCities: ["Rome", "Venice", "Florence", "Bologna"],
    activityTypes: ["Vatican Tour", "Canal Tour", "Art Museum", "Wine Region", "Coastal Walk", "Historic City"],
    activityDescriptions: {
      "Vatican Tour": ["Vatican Museums and Sistine Chapel", "Papal basilica tour", "Vatican City exploration"],
      "Canal Tour": ["Venetian gondola ride", "Canal system boat tour", "Historic waterway exploration"],
      "Art Museum": ["Uffizi Gallery masterpieces", "Renaissance art collection tour", "Florence museum circuit"],
    },
    majorcities: ["Rome", "Venice", "Florence", "Milan", "Bologna"],
  },
  "Germany": {
    hotelStyles: ["Castle Hotel", "Modern Berlin", "Alpine Resort", "Historic", "Contemporary Luxury"],
    hotelNames: ["Adlon Kempinski", "Hotel de Rome", "Waldorf Astoria", "Regent", "Mandarin Oriental"],
    hotelCities: ["Berlin", "Munich", "Hamburg", "Cologne", "Heidelberg"],
    cuisines: ["German", "Schnitzel", "Beer Hall", "Bavarian", "Pretzel", "Sausage"],
    restaurantNames: ["Horváth", "Facil", "Quique Dacosta", "Zur Letzten Instanz"],
    restaurantCities: ["Berlin", "Munich", "Hamburg", "Cologne"],
    activityTypes: ["Castle Tour", "Beer Garden", "Museum", "Neuschwanstein", "Christmas Market", "Beer Hall"],
    activityDescriptions: {
      "Castle Tour": ["Neuschwanstein Castle visit", "Rhine Valley castle tour", "Medieval fortress exploration"],
      "Beer Garden": ["Traditional Bavarian beer hall experience", "Local beer tasting and culture", "Historic beer garden dining"],
      "Christmas Market": ["Festive holiday market experience", "Traditional German crafts and food", "Seasonal celebration tour"],
    },
    majorcities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
  },
}

export function generateDynamicHotels(
  countryName: string,
  seed: number,
  count: number = 3
): DynamicHotel[] {
  const countryData = COUNTRY_DATA[countryName]
  if (!countryData) return []

  const hotels: DynamicHotel[] = []
  const usedIndices = new Set<number>()

  for (let i = 0; i < count; i++) {
    // Use seed to generate pseudo-random but deterministic indices
    const nameIndex = (seed + i * 17) % countryData.hotelNames.length
    const cityIndex = (seed + i * 23) % countryData.hotelCities.length
    const styleIndex = (seed + i * 31) % countryData.hotelStyles.length
    
    const name = countryData.hotelNames[nameIndex]
    const city = countryData.hotelCities[cityIndex]
    const style = countryData.hotelStyles[styleIndex]
    
    // Vary price levels
    const priceLevel = ["$", "$$", "$$$", "$$$$"][(seed + i * 7) % 4]
    const rating = 3.8 + (((seed + i * 11) % 20) / 100)
    
    hotels.push({
      name: `${name} ${city}`,
      rating: Math.min(4.9, Math.round(rating * 100) / 100),
      location: city,
      category: style,
      price_level: priceLevel,
      style,
      activity_level: ["Relaxed", "Moderate", "Active"][(seed + i * 13) % 3],
    })
  }

  return hotels
}

export function generateDynamicRestaurants(
  countryName: string,
  seed: number,
  count: number = 3
): DynamicRestaurant[] {
  const countryData = COUNTRY_DATA[countryName]
  if (!countryData) return []

  const restaurants: DynamicRestaurant[] = []

  for (let i = 0; i < count; i++) {
    const nameIndex = (seed + i * 19) % countryData.restaurantNames.length
    const cityIndex = (seed + i * 29) % countryData.restaurantCities.length
    const cuisineIndex = (seed + i * 37) % countryData.cuisines.length
    
    const name = countryData.restaurantNames[nameIndex]
    const city = countryData.restaurantCities[cityIndex]
    const cuisine = countryData.cuisines[cuisineIndex]
    
    const rating = 4.0 + (((seed + i * 11) % 90) / 100)
    const categories = ["Fine Dining", "Casual", "Street Food", "Farm-to-table"]
    const category = categories[(seed + i * 7) % categories.length]
    
    restaurants.push({
      name: `${name} ${city}`,
      rating: Math.min(4.9, Math.round(rating * 100) / 100),
      location: city,
      cuisine,
      category,
    })
  }

  return restaurants
}

export function generateDynamicActivities(
  countryName: string,
  seed: number,
  count: number = 3
): DynamicActivity[] {
  const countryData = COUNTRY_DATA[countryName]
  if (!countryData) return []

  const activities: DynamicActivity[] = []

  for (let i = 0; i < count; i++) {
    const typeIndex = (seed + i * 41) % countryData.activityTypes.length
    const activityType = countryData.activityTypes[typeIndex]
    
    const descriptions = countryData.activityDescriptions[activityType] || [
      `Experience ${activityType.toLowerCase()} in ${countryName}`,
      `Explore local ${activityType.toLowerCase()} attractions`,
      `Guided ${activityType.toLowerCase()} tour and adventure`,
    ]
    
    const descIndex = (seed + i * 13) % descriptions.length
    
    const durations = ["2-3 hours", "Half day", "Full day", "3-4 hours"]
    const durationIndex = (seed + i * 7) % durations.length
    
    activities.push({
      title: `${activityType} Experience ${i + 1}`,
      description: descriptions[descIndex],
      duration: durations[durationIndex],
    })
  }

  return activities
}
