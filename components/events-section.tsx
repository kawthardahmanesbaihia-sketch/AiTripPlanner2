"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, Loader2 } from "lucide-react"

interface Event {
  id: string
  name: string
  image?: string
  date: string
  location: string
  description: string
  url: string
  category: string
  relevanceScore: number
}

interface EventsSectionProps {
  country: string
  city?: string
  startDate: string
  endDate: string
  userPreferences?: string[]
}

export function EventsSection({
  country,
  city,
  startDate,
  endDate,
  userPreferences = [],
}: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Fetching events for:", { country, startDate, endDate })
        
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: city || country,
            startDate,
            endDate,
            userPreferences,
          }),
        })

        console.log("[v0] Events API response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] API error response:", errorData)
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Events API data:", { count: data.events?.length, cached: data.cached })
        
        // Handle both real and fallback events
        setEvents(data.events || [])
        
        if (data.error) {
          setError(data.error)
        }
      } catch (err) {
        console.error("[v0] Error fetching events:", err)
        setError("Unable to load events at this time")
        // Set mock events as fallback
        const mockEvents = generateMockEvents(country, startDate, endDate, userPreferences)
        console.log("[v0] Using mock events fallback:", mockEvents.length)
        setEvents(mockEvents)
      } finally {
        setLoading(false)
      }
    }

    if (country && startDate && endDate) {
      fetchEvents()
    }
  }, [country, city, startDate, endDate, userPreferences])

  const getEventImage = (category: string): string => {
    const eventImages: Record<string, string[]> = {
      culture: [
        "https://images.unsplash.com/photo-1478314143081-80f7f84ca84d?w=400&q=80",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
      ],
      food: [
        "https://images.unsplash.com/photo-1504674900967-a8126e4c6555?w=400&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561f1d?w=400&q=80",
      ],
      music: [
        "https://images.unsplash.com/photo-1519671482677-11fbb972b814?w=400&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
      ],
      entertainment: [
        "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80",
        "https://images.unsplash.com/photo-1501281668051-fcbeeb3cdc60?w=400&q=80",
      ],
      nature: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80",
        "https://images.unsplash.com/photo-1551632786-de41ec4a306b?w=400&q=80",
      ],
      outdoor: [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80",
        "https://images.unsplash.com/photo-1433086720868-02b09e78b1c7?w=400&q=80",
      ],
    }
    
    const categoryLower = category.toLowerCase()
    const images = eventImages[categoryLower] || eventImages.culture
    return images[Math.floor(Math.random() * images.length)]
  }

  const generateMockEvents = (
    location: string,
    start: string,
    end: string,
    prefs: string[]
  ): Event[] => {
    const eventTypes: Record<string, Array<{ name: string; category: string }>> = {
      nature: [
        { name: "Hiking Festival", category: "Outdoor" },
        { name: "Bird Watching Tour", category: "Nature" },
        { name: "Mountain Climate Summit", category: "Nature" },
      ],
      culture: [
        { name: "Local Art Exhibition", category: "Culture" },
        { name: "Traditional Festival", category: "Culture" },
        { name: "Museum Night", category: "Culture" },
      ],
      food: [
        { name: "Food Market Festival", category: "Food" },
        { name: "Cooking Class Showcase", category: "Food" },
        { name: "Culinary Night Market", category: "Food" },
      ],
      nightlife: [
        { name: "Live Music Fest", category: "Entertainment" },
        { name: "Night Club Grand Opening", category: "Entertainment" },
        { name: "Concert Series", category: "Music" },
      ],
    }

    const preference = prefs.find((p) => eventTypes[p.toLowerCase()]) || "culture"
    const baseEvents = eventTypes[preference.toLowerCase()] || eventTypes.culture

    return baseEvents.slice(0, 3).map((event, index) => ({
      id: `event-${index}`,
      name: event.name,
      date: new Date(start).toDateString(),
      location: location,
      description: `Exciting ${event.category.toLowerCase()} event happening in ${location}. Join locals and travelers for an unforgettable experience.`,
      url: "https://www.eventbrite.com",
      category: event.category,
      image: getEventImage(event.category),
      relevanceScore: 0.85 + Math.random() * 0.15,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error && events.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">Events During Your Trip</h2>
      </div>

      <p className="text-muted-foreground">
        Curated events matching your travel preferences happening during your visit to {country}
      </p>

      {events.length === 0 ? (
        <Card className="border-2 bg-card/50 p-8 text-center">
          <p className="text-muted-foreground">No events available for your travel dates</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="group overflow-hidden border-2 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 h-full flex flex-col">
                {/* Event Image */}
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Calendar className="h-12 w-12 text-primary/30" />
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3">
                  {/* Event Category Badge */}
                  <Badge variant="secondary">{event.category}</Badge>

                  {/* Event Title */}
                  <h3 className="text-lg font-semibold line-clamp-2">{event.name}</h3>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Event Description */}
                  <p className="text-sm line-clamp-3">{event.description}</p>

                  {/* Relevance Score */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${event.relevanceScore * 100}%` }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {Math.round(event.relevanceScore * 100)}% match
                    </span>
                  </div>
                </div>

                {/* Learn More Button */}
                <div className="p-4 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full group/btn"
                  >
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Learn More
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
