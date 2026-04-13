/**
 * Geoapify API Client
 * Fetches real hotels and restaurants with map coordinates
 */

export interface MapPlace {
  name: string
  type: "hotel" | "restaurant"
  lat: number
  lng: number
  address: string
  rating?: number
  description?: string
  phone?: string
}

export interface GeoAPIHotel extends MapPlace {
  type: "hotel"
  price_level?: string
  website?: string
}

export interface GeoAPIRestaurant extends MapPlace {
  type: "restaurant"
  cuisine?: string
  website?: string
}

async function getCountryCoordinates(countryName: string): Promise<{ lat: number; lng: number }> {
  // Country center coordinates mapping
  const countryCoords: Record<string, { lat: number; lng: number }> = {
    France: { lat: 46.2276, lng: 2.2137 },
    Italy: { lat: 41.8719, lng: 12.5674 },
    Spain: { lat: 40.463667, lng: -3.74922 },
    Germany: { lat: 51.1657, lng: 10.4515 },
    Japan: { lat: 36.2048, lng: 138.2529 },
    Thailand: { lat: 15.87, lng: 100.9925 },
    Mexico: { lat: 23.6345, lng: -102.5528 },
    Brazil: { lat: -14.2350, lng: -51.9253 },
    "United States": { lat: 37.0902, lng: -95.7129 },
    Canada: { lat: 56.1304, lng: -106.3468 },
    "United Kingdom": { lat: 55.3781, lng: -3.436 },
    Australia: { lat: -25.2744, lng: 133.7751 },
    India: { lat: 20.5937, lng: 78.9629 },
    Egypt: { lat: 26.8206, lng: 30.8025 },
    Greece: { lat: 39.074208, lng: 21.824312 },
    Portugal: { lat: 39.3999, lng: -8.2245 },
    Turkey: { lat: 38.9637, lng: 35.2433 },
    Vietnam: { lat: 14.0583, lng: 108.2772 },
    Indonesia: { lat: -0.7893, lng: 113.9213 },
    "South Korea": { lat: 35.9078, lng: 127.7669 },
  }

  // Try exact match first
  if (countryCoords[countryName]) {
    return countryCoords[countryName]
  }

  // Try partial match
  for (const [country, coords] of Object.entries(countryCoords)) {
    if (countryName.toLowerCase().includes(country.toLowerCase()) || 
        country.toLowerCase().includes(countryName.toLowerCase())) {
      return coords
    }
  }

  // Default to world center if not found
  return { lat: 20, lng: 0 }
}

export async function fetchHotelsWithCoordinates(
  countryName: string,
  cityName?: string
): Promise<GeoAPIHotel[]> {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY
    
    if (!apiKey) {
      console.log("[Geoapify] API key not configured, returning mock data")
      return getMockHotels(countryName)
    }

    const coords = await getCountryCoordinates(countryName)
    const searchRadius = 50000 // 50km radius
    const city = cityName || countryName

    console.log("[Geoapify] Fetching hotels for:", { country: countryName, city, coords })

    const response = await fetch(
      `https://api.geoapify.com/v2/places?` +
      `categories=accommodation.hotel` +
      `&filter=circle:${coords.lng},${coords.lat},${searchRadius}` +
      `&limit=10` +
      `&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error("[Geoapify] Hotel fetch failed:", response.statusText)
      return getMockHotels(countryName)
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("[Geoapify] No hotels found, returning mock data")
      return getMockHotels(countryName)
    }

    const hotels = data.features.map((feature: any) => {
      const props = feature.properties
      return {
        name: props.name || "Hotel",
        type: "hotel" as const,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        address: props.formatted || props.address_line1 || "Location",
        rating: props.rating || 4.5,
        description: props.description || "Comfortable accommodation",
        price_level: props.price_level || "$$$",
        phone: props.phone,
        website: props.website,
      }
    })

    return hotels.slice(0, 8)
  } catch (error) {
    console.error("[Geoapify] Error fetching hotels:", error)
    return getMockHotels(countryName)
  }
}

export async function fetchRestaurantsWithCoordinates(
  countryName: string,
  cuisineType?: string
): Promise<GeoAPIRestaurant[]> {
  try {
    const apiKey = process.env.GEOAPIFY_API_KEY
    
    if (!apiKey) {
      console.log("[Geoapify] API key not configured, returning mock data")
      return getMockRestaurants(countryName)
    }

    const coords = await getCountryCoordinates(countryName)
    const searchRadius = 50000 // 50km radius

    console.log("[Geoapify] Fetching restaurants for:", { country: countryName, coords })

    const response = await fetch(
      `https://api.geoapify.com/v2/places?` +
      `categories=catering.restaurant` +
      `&filter=circle:${coords.lng},${coords.lat},${searchRadius}` +
      `&limit=10` +
      `&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error("[Geoapify] Restaurant fetch failed:", response.statusText)
      return getMockRestaurants(countryName)
    }

    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      console.log("[Geoapify] No restaurants found, returning mock data")
      return getMockRestaurants(countryName)
    }

    const restaurants = data.features.map((feature: any) => {
      const props = feature.properties
      return {
        name: props.name || "Restaurant",
        type: "restaurant" as const,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        address: props.formatted || props.address_line1 || "Location",
        rating: props.rating || 4.2,
        description: props.description || "Great dining experience",
        cuisine: props.cuisine || "International",
        phone: props.phone,
        website: props.website,
      }
    })

    return restaurants.slice(0, 8)
  } catch (error) {
    console.error("[Geoapify] Error fetching restaurants:", error)
    return getMockRestaurants(countryName)
  }
}

function getMockHotels(countryName: string): GeoAPIHotel[] {
  const mockHotels: Record<string, GeoAPIHotel[]> = {
    France: [
      {
        name: "Hotel Le Marais",
        type: "hotel",
        lat: 48.8566,
        lng: 2.3522,
        address: "4 Rue de Sevigne, 75004 Paris",
        rating: 4.7,
        price_level: "$$$",
        description: "Luxury 4-star hotel in the heart of Paris",
      },
      {
        name: "Eiffel Tower Hotel",
        type: "hotel",
        lat: 48.8584,
        lng: 2.2945,
        address: "30 Avenue de Camoëns, 75016 Paris",
        rating: 4.5,
        price_level: "$$$",
        description: "Elegant hotel with stunning Eiffel Tower views",
      },
      {
        name: "Boutique Hotel Saint Michel",
        type: "hotel",
        lat: 48.8530,
        lng: 2.3437,
        address: "Place Saint-Michel, 75005 Paris",
        rating: 4.4,
        price_level: "$$",
        description: "Charming boutique hotel near Latin Quarter",
      },
    ],
    Italy: [
      {
        name: "Hotel Colonna Palace",
        type: "hotel",
        lat: 41.9028,
        lng: 12.4964,
        address: "Piazza Colonna, 00187 Rome",
        rating: 4.8,
        price_level: "$$$",
        description: "5-star luxury hotel in downtown Rome",
      },
      {
        name: "Trevi Fountain Hotel",
        type: "hotel",
        lat: 41.9009,
        lng: 12.4833,
        address: "Via di Propaganda, 00187 Rome",
        rating: 4.6,
        price_level: "$$$",
        description: "Elegant hotel near the famous Trevi Fountain",
      },
    ],
    Spain: [
      {
        name: "Sagrada Familia Hotel",
        type: "hotel",
        lat: 41.4036,
        lng: 2.1744,
        address: "Carrer de Còrsega, 08008 Barcelona",
        rating: 4.7,
        price_level: "$$$",
        description: "Modern hotel near Sagrada Familia basilica",
      },
    ],
    Japan: [
      {
        name: "Senso-ji Temple Hotel",
        type: "hotel",
        lat: 35.7148,
        lng: 139.7967,
        address: "Asakusa, Taito Ward, Tokyo",
        rating: 4.6,
        price_level: "$$",
        description: "Traditional-style hotel near historic temple",
      },
    ],
    Thailand: [
      {
        name: "Grand Palace Hotel",
        type: "hotel",
        lat: 13.6528,
        lng: 100.4917,
        address: "Na Phra Lan, Bangkok",
        rating: 4.5,
        price_level: "$$",
        description: "Luxury hotel in the heart of Bangkok",
      },
    ],
  }

  return mockHotels[countryName] || [
    {
      name: `${countryName} Central Hotel`,
      type: "hotel",
      lat: 20,
      lng: 0,
      address: `Main district, ${countryName}`,
      rating: 4.5,
      price_level: "$$",
      description: "Quality accommodation in the city center",
    },
    {
      name: `${countryName} Deluxe Resort`,
      type: "hotel",
      lat: 20.1,
      lng: 0.1,
      address: `Resort area, ${countryName}`,
      rating: 4.7,
      price_level: "$$$",
      description: "Premium resort with excellent amenities",
    },
  ]
}

function getMockRestaurants(countryName: string): GeoAPIRestaurant[] {
  const mockRestaurants: Record<string, GeoAPIRestaurant[]> = {
    France: [
      {
        name: "Le Jules Verne",
        type: "restaurant",
        lat: 48.8584,
        lng: 2.2945,
        address: "5 Avenue Anatole France, 75007 Paris",
        rating: 4.9,
        cuisine: "French",
        description: "Michelin-starred French cuisine",
      },
      {
        name: "Bistro Montmartre",
        type: "restaurant",
        lat: 48.8867,
        lng: 2.3431,
        address: "Place du Tertre, 75018 Paris",
        rating: 4.4,
        cuisine: "French",
        description: "Traditional Parisian bistro",
      },
    ],
    Italy: [
      {
        name: "Armando al Pantheon",
        type: "restaurant",
        lat: 41.8986,
        lng: 12.4769,
        address: "Salita de' Crescenzi, 31, Rome",
        rating: 4.8,
        cuisine: "Italian",
        description: "Family-run Roman restaurant since 1961",
      },
      {
        name: "Trattoria da Valentino",
        type: "restaurant",
        lat: 41.9000,
        lng: 12.5000,
        address: "Via del Corso, Rome",
        rating: 4.6,
        cuisine: "Italian",
        description: "Authentic Italian trattoria",
      },
    ],
    Spain: [
      {
        name: "El Xampanyet",
        type: "restaurant",
        lat: 41.3851,
        lng: 2.1734,
        address: "Carrer de Montcada, 22, Barcelona",
        rating: 4.5,
        cuisine: "Spanish Tapas",
        description: "Traditional Spanish tapas bar",
      },
    ],
    Japan: [
      {
        name: "Sukiyabashi Jiro",
        type: "restaurant",
        lat: 35.6762,
        lng: 139.7474,
        address: "Ginza, Chuo Ward, Tokyo",
        rating: 4.9,
        cuisine: "Japanese Sushi",
        description: "World-renowned 3-star Michelin sushi restaurant",
      },
    ],
    Thailand: [
      {
        name: "Gaggan",
        type: "restaurant",
        lat: 13.7563,
        lng: 100.5018,
        address: "Soi Langsuan, Bangkok",
        rating: 4.8,
        cuisine: "Thai Fusion",
        description: "Progressive Thai cuisine",
      },
    ],
  }

  return mockRestaurants[countryName] || [
    {
      name: `${countryName} Cuisine Restaurant`,
      type: "restaurant",
      lat: 20,
      lng: 0,
      address: `Downtown, ${countryName}`,
      rating: 4.4,
      cuisine: "Local",
      description: "Authentic local cuisine",
    },
    {
      name: `International Bistro ${countryName}`,
      type: "restaurant",
      lat: 20.1,
      lng: 0.1,
      address: `City center, ${countryName}`,
      rating: 4.6,
      cuisine: "International",
      description: "Fine dining experience",
    },
  ]
}
