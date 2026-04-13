"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MapPin, Hotel, Utensils, Activity, ArrowLeft, Sparkles, Star, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"
import { useParams } from "next/navigation"
import { EventsSection } from "@/components/events-section"
import { WeatherSection } from "@/components/weather-section"
import { HolidayWarning } from "@/components/holiday-warning"
import { getCountryCode, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { generateCategoryImage } from "@/lib/category-image-generator"
import { InteractiveMap } from "@/components/interactive-map"

interface MapPlace {
  name: string
  type: "hotel" | "restaurant"
  lat: number
  lng: number
  address: string
  rating?: number
  description?: string
}

interface CountryCoordinates {
  lat: number
  lng: number
}

interface DestinationData {
  name: string
  matchPercentage: number
  image: string
  positives: string[]
  negatives: string[]
  hotels: Array<{
    name: string
    rating: number
    description: string
    price: string
    image?: string
  }>
  restaurants: Array<{
    name: string
    cuisine: string
    description: string
    image?: string
  }>
  activities: Array<{
    name: string
    duration: string
    description: string
    image?: string
  }>
}

export default function DestinationPage() {
  const params = useParams()
  const [destination, setDestination] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [travelDates, setTravelDates] = useState<{ start: string; end: string } | null>(null)
  const [placesData, setPlacesData] = useState<MapPlace[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [countryCoordinates, setCountryCoordinates] = useState<CountryCoordinates>({ lat: 20, lng: 0 })
  const { t } = useLanguage()

  useEffect(() => {
    const loadDestination = async () => {
      const index = parseInt(params.id as string, 10);
      const results = sessionStorage.getItem("analysisResults");
      const dates = sessionStorage.getItem("travelDates");

      // Parse travel dates
      if (dates) {
        try {
          const parsedDates = JSON.parse(dates);
          setTravelDates({
            start: parsedDates.start,
            end: parsedDates.end,
          });
        } catch (e) {
          console.error("[v0] Error parsing travel dates:", e);
        }
      }

      if (results) {
        try {
          const parsed = JSON.parse(results);
          const country = parsed.countries?.[index];

          if (!country) {
            setLoading(false);
            return;
          }

          // Fetch additional details from API
          try {
            const detailsResponse = await fetch("/api/destination", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                countryCode: country.code || "US",
                countryName: country.name,
                climate: country.climate || "temperate",
                activities: country.activities || [],
                userPreferences: country.tags || [],
              }),
              cache: "no-store",
            });

            const details = detailsResponse.ok ? await detailsResponse.json() : {};

            // Generate category images in parallel
            const [hotelImg, restaurantImg, activityImg] = await Promise.all([
              generateCategoryImage(country.name, "hotels"),
              generateCategoryImage(country.name, "restaurants"),
              generateCategoryImage(country.name, "activities"),
            ]);

            setDestination({
              name: country.name,
              matchPercentage: Math.round(country.matchPercentage || 0),
              image: details.destinationImage || country.image,
              positives: country.positives || [
                "Matches your travel preferences",
                "Great outdoor activities available",
                "Excellent local cuisine scene",
              ],
              negatives: details.negatives || country.negatives || [
                "Can be crowded during peak seasons",
                "Limited public transportation in some areas",
                "Language barriers may exist",
              ],
              hotels: (details.hotels || []).slice(0, 3).map((h: any, idx: number) => ({
                name: h.name,
                rating: h.rating || 4.5,
                description: h.category || h.description || "Great accommodation",
                price: h.price_level || h.price || "$$$",
                image: idx === 0 ? hotelImg : undefined,
              })),
              restaurants: (details.restaurants || []).slice(0, 3).map((r: any, idx: number) => ({
                name: r.name,
                cuisine: r.cuisine || r.category,
                description: r.description || `${r.rating || 4.5}⭐ ${r.category || "Restaurant"}`,
                image: idx === 0 ? restaurantImg : undefined,
              })),
              activities: (details.activities || []).slice(0, 3).map((a: any, idx: number) => ({
                name: a.title || a.name,
                duration: a.duration || "Half day",
                description: a.description || "Exciting activity",
                image: idx === 0 ? activityImg : undefined,
              })),
            });
          } catch (apiError) {
            console.error("[v0] Error fetching destination details:", apiError);
            // Use basic fallback
            setDestination({
              name: country.name,
              matchPercentage: Math.round(country.matchPercentage || 0),
              image: country.image,
              positives: country.positives || [
                "Matches your travel preferences",
                "Great outdoor activities available",
                "Excellent local cuisine scene",
              ],
              negatives: country.negatives || [
                "Can be crowded during peak seasons",
                "Limited public transportation in some areas",
              ],
              hotels: [
                { name: "Hotel", rating: 4.5, description: "Great accommodation", price: "$$$" },
              ],
              restaurants: [
                { name: "Restaurant", cuisine: "Local", description: "Great dining" },
              ],
              activities: [
                { name: "Activity", duration: "Full day", description: "Exciting experience" },
              ],
            });
          }
        } catch (error) {
          console.error("[v0] Error loading destination:", error);
        }
      }

      setLoading(false);
    }

    loadDestination();
  }, [params])

  // Geocode country to get coordinates
  useEffect(() => {
    const geocodeCountry = async () => {
      if (!destination) return

      try {
        // Use Geoapify geocoding to get country center
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(destination.name)}&` +
          `format=json&` +
          `limit=1`,
          { next: { revalidate: 86400 } }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            const coords = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            }
            console.log("[v0] Geocoded country coordinates:", coords)
            setCountryCoordinates(coords)
            return
          }
        }
      } catch (error) {
        console.error("[v0] Geocoding error:", error)
      }

      // Fallback to country mapping if geocoding fails
      const countryCoords: Record<string, CountryCoordinates> = {
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

      if (countryCoords[destination.name]) {
        setCountryCoordinates(countryCoords[destination.name])
      }
    }

    geocodeCountry()
  }, [destination])

  // Fetch hotels and restaurants
  useEffect(() => {
    const fetchPlaces = async () => {
      if (!destination) return

      setPlacesLoading(true)
      try {
        const response = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryName: destination.name, type: "both" }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Fetched places:", data)
          setPlacesData(data.allPlaces || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching places:", error)
        setPlacesData([])
      } finally {
        setPlacesLoading(false)
      }
    }

    fetchPlaces()
  }, [destination])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Destination not found</p>
          <Button asChild>
            <Link href="/results">Back to Results</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/results" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Link>
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 rounded-2xl overflow-hidden border-2 border-border"
        >
          <div className="relative h-80 bg-gradient-to-br from-primary/20 to-secondary">
            <img
              src={destination.image}
              alt={destination.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-8 text-white flex items-end gap-6 w-full">
                <div>
                  {/* Country Flag */}
                  <img
                    src={getCountryFlagUrl(destination.name)}
                    alt={`${destination.name} flag`}
                    className="h-20 w-32 rounded object-cover border-2 border-white shadow-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = "https://flagsapi.com/XX/flat/64.png"
                    }}
                  />
                </div>
                <div>
                  <h1 className="mb-2 text-5xl font-bold">{destination.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-bold text-lg">
                      {destination.matchPercentage}%
                    </div>
                    <span className="text-lg">Perfect Match for You</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Holiday Warning */}
        {travelDates && destination && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <HolidayWarning
              countryCode={getCountryCode(destination.name)}
              countryName={destination.name}
              startDate={new Date(travelDates.start)}
              endDate={new Date(travelDates.end)}
            />
          </motion.div>
        )}

        {/* Positives and Negatives */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 h-full">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-500">
                  <ThumbsUp className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Why You'll Love It</h2>
              </div>
              <ul className="space-y-3">
                {destination.positives.map((positive, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 flex h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{positive}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 h-full">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                  <ThumbsDown className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Things to Consider</h2>
              </div>
              <ul className="space-y-3">
                {destination.negatives.map((negative, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 flex h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">{negative}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Weather Forecast */}
        {travelDates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <WeatherSection
              country={destination.name}
              startDate={travelDates.start}
              endDate={travelDates.end}
            />
          </motion.div>
        )}

        {/* Real Hotels & Restaurants with Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-3xl font-bold">Explore Hotels & Restaurants</h2>

          {/* Map Section */}
          {placesData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <InteractiveMap
                locations={placesData}
                centerLat={countryCoordinates.lat}
                centerLng={countryCoordinates.lng}
                zoom={8}
              />
            </motion.div>
          ) : placesLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
          ) : null}

          {/* Real Hotels Grid */}
          {placesData.filter((p) => p.type === "hotel").length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <Hotel className="h-6 w-6 text-primary" />
                Real Hotels Near {destination.name}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {placesData
                  .filter((p) => p.type === "hotel")
                  .slice(0, 6)
                  .map((hotel, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                    >
                      <Card className="border-2 bg-card/50 backdrop-blur-sm p-4 hover:shadow-lg transition-all h-full flex flex-col">
                        <div className="mb-3 flex items-start justify-between">
                          <h4 className="font-bold text-base flex-1 line-clamp-2">{hotel.name}</h4>
                          {hotel.rating && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold">{hotel.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{hotel.address}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 flex-grow line-clamp-2">{hotel.description}</p>
                        <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                          <a
                            href={`https://maps.google.com/?q=${hotel.lat},${hotel.lng}(${encodeURIComponent(hotel.name)})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1"
                          >
                            View on Maps
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Real Restaurants Grid */}
          {placesData.filter((p) => p.type === "restaurant").length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <Utensils className="h-6 w-6 text-primary" />
                Real Restaurants Near {destination.name}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {placesData
                  .filter((p) => p.type === "restaurant")
                  .slice(0, 6)
                  .map((restaurant, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Card className="border-2 bg-card/50 backdrop-blur-sm p-4 hover:shadow-lg transition-all h-full flex flex-col">
                        <div className="mb-3 flex items-start justify-between">
                          <h4 className="font-bold text-base flex-1 line-clamp-2">{restaurant.name}</h4>
                          {restaurant.rating && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold">{restaurant.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 flex-grow line-clamp-2">{restaurant.description}</p>
                        <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                          <a
                            href={`https://maps.google.com/?q=${restaurant.lat},${restaurant.lng}(${encodeURIComponent(restaurant.name)})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1"
                          >
                            View on Maps
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Hotels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
            <Hotel className="h-8 w-8 text-primary" />
            Recommended Hotels
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {destination.hotels.map((hotel, index) => (
              <Card key={index} className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg">
                {hotel.image && (
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-bold text-lg">{hotel.name}</h3>
                    <Badge variant="secondary">{hotel.price}</Badge>
                  </div>
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{hotel.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Restaurants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
            <Utensils className="h-8 w-8 text-primary" />
            Must-Try Restaurants
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {destination.restaurants.map((restaurant, index) => (
              <Card key={index} className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg">
                {restaurant.image && (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="p-6">
                  <h3 className="mb-2 font-bold text-lg">{restaurant.name}</h3>
                  <Badge className="mb-3" variant="outline">
                    {restaurant.cuisine}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
            <Activity className="h-8 w-8 text-primary" />
            Top Activities
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {destination.activities.map((activity, index) => (
              <Card key={index} className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg">
                {activity.image && (
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="p-6">
                  <h3 className="mb-2 font-bold text-lg">{activity.name}</h3>
                  <Badge className="mb-3" variant="secondary">
                    {activity.duration}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Events During Your Trip */}
        {travelDates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <EventsSection
              country={destination.name}
              startDate={travelDates.start}
              endDate={travelDates.end}
              userPreferences={["culture", "food", "adventure"]}
            />
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Button asChild size="lg" className="shadow-lg shadow-primary/30">
            <Link href="/results">View Other Destinations</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
