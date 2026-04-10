"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Hotel, Utensils, Activity } from "lucide-react"

interface MapLocation {
  name: string
  type: "hotel" | "restaurant" | "activity"
  lat: number
  lng: number
  description: string
}

interface InteractiveMapProps {
  locations: MapLocation[]
  centerLat?: number
  centerLng?: number
  zoom?: number
}

export function InteractiveMap({
  locations,
  centerLat = 20,
  centerLng = 0,
  zoom = 3,
}: InteractiveMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const getIconColor = (type: string) => {
    switch (type) {
      case "hotel":
        return "from-blue-400 to-blue-600"
      case "restaurant":
        return "from-orange-400 to-red-600"
      case "activity":
        return "from-green-400 to-emerald-600"
      default:
        return "from-purple-400 to-purple-600"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="h-5 w-5" />
      case "restaurant":
        return <Utensils className="h-5 w-5" />
      case "activity":
        return <Activity className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  // Simple SVG map visualization as placeholder
  // In production, replace with actual Mapbox integration
  return (
    <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden border-2 border-border">
      {/* SVG Map Background */}
      <svg
        viewBox="0 0 1200 600"
        className="w-full h-96"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        {/* Decorative map elements */}
        <circle cx="300" cy="150" r="200" fill="rgba(255,255,255,0.05)" />
        <circle cx="900" cy="450" r="250" fill="rgba(255,255,255,0.05)" />
        <path
          d="M 0 250 Q 300 200, 600 250 T 1200 250"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Overlay Content */}
      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">Location Map</h3>
          <p className="text-sm text-white/80">Hotels, Restaurants & Activities</p>
        </div>

        {/* Location Legend */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { type: "hotel", label: "Hotels", icon: Hotel },
            { type: "restaurant", label: "Restaurants", icon: Utensils },
            { type: "activity", label: "Activities", icon: Activity },
          ].map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {locations.slice(0, 8).map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onHoverStart={() => setHoveredLocation(index)}
              onHoverEnd={() => setHoveredLocation(null)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                hoveredLocation === index
                  ? "bg-white/20 scale-105"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getIconColor(
                    location.type,
                  )} text-white`}
                >
                  {getIcon(location.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {location.name}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {location.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Note */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white">
        Interactive map visualization
      </div>
    </div>
  )
}
