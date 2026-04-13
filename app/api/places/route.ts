import { NextRequest, NextResponse } from "next/server"
import {
  fetchHotelsWithCoordinates,
  fetchRestaurantsWithCoordinates,
  type MapPlace,
} from "@/lib/geoapify-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PlacesRequest {
  countryName: string
  cityName?: string
  type?: "hotels" | "restaurants" | "both"
}

export async function POST(request: NextRequest) {
  try {
    const body: PlacesRequest = await request.json()
    const { countryName, cityName, type = "both" } = body

    console.log("[Places API] Fetching places for:", { countryName, cityName, type })

    const [hotels, restaurants] = await Promise.allSettled([
      type === "hotels" || type === "both" ? fetchHotelsWithCoordinates(countryName, cityName) : Promise.resolve([]),
      type === "restaurants" || type === "both" ? fetchRestaurantsWithCoordinates(countryName) : Promise.resolve([]),
    ])

    const hotelsList = hotels.status === "fulfilled" ? hotels.value : []
    const restaurantsList = restaurants.status === "fulfilled" ? restaurants.value : []

    const allPlaces: MapPlace[] = [...hotelsList, ...restaurantsList]

    console.log("[Places API] Found", hotelsList.length, "hotels and", restaurantsList.length, "restaurants")

    return NextResponse.json(
      {
        success: true,
        countryName,
        hotelsList,
        restaurantsList,
        allPlaces,
        totalCount: allPlaces.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error("[Places API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch places", success: false },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const countryName = searchParams.get("country")
    const cityName = searchParams.get("city")
    const type = (searchParams.get("type") || "both") as "hotels" | "restaurants" | "both"

    if (!countryName) {
      return NextResponse.json(
        { error: "Country name is required", success: false },
        { status: 400 }
      )
    }

    console.log("[Places API] GET request for:", { countryName, cityName, type })

    const [hotels, restaurants] = await Promise.allSettled([
      type === "hotels" || type === "both" ? fetchHotelsWithCoordinates(countryName, cityName) : Promise.resolve([]),
      type === "restaurants" || type === "both" ? fetchRestaurantsWithCoordinates(countryName) : Promise.resolve([]),
    ])

    const hotelsList = hotels.status === "fulfilled" ? hotels.value : []
    const restaurantsList = restaurants.status === "fulfilled" ? restaurants.value : []

    const allPlaces: MapPlace[] = [...hotelsList, ...restaurantsList]

    return NextResponse.json(
      {
        success: true,
        countryName,
        hotelsList,
        restaurantsList,
        allPlaces,
        totalCount: allPlaces.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error("[Places API] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch places", success: false },
      { status: 500 }
    )
  }
}
