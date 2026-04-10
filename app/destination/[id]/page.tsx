"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MapPin, Hotel, Utensils, Activity, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"
import { useParams } from "next/navigation"
import { EventsSection } from "@/components/events-section"
import { WeatherSection } from "@/components/weather-section"
import { HolidayWarning } from "@/components/holiday-warning"
import { getCountryCode, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { getDestinationImage } from "@/lib/destination-images"
import { fetchPexelsImages } from "@/lib/pexels-service"

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

            // Fetch category images from Pexels in parallel
            const [hotelResponse, restaurantResponse, activityResponse] = await Promise.all([
              fetchPexelsImages(`${country.name} hotel accommodation`, 1),
              fetchPexelsImages(`${country.name} restaurant dining food`, 1),
              fetchPexelsImages(`${country.name} activities adventure`, 1),
            ]);
            
            const hotelImg = hotelResponse.photos?.[0]?.src?.large || null;
            const restaurantImg = restaurantResponse.photos?.[0]?.src?.large || null;
            const activityImg = activityResponse.photos?.[0]?.src?.large || null;

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
