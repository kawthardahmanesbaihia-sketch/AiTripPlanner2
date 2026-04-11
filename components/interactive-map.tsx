"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Hotel, Utensils, Activity, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapLocation {
  name: string
  type: "hotel" | "restaurant" | "activity"
  lat: number
  lng: number
  description: string
  address?: string
  rating?: number
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
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

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

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const generateMapUrl = (lat: number, lng: number, name: string) => {
    return `https://maps.google.com/?q=${lat},${lng}(${encodeURIComponent(name)})`
  }

  // SVG-based interactive map with marker visualization
  return (
    <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden border-2 border-border">
      {/* Map Background with Simplified Grid */}
      <div className="relative w-full min-h-96 bg-gradient-to-br from-blue-400/20 via-blue-300/10 to-blue-400/20 dark:from-blue-900/20 dark:via-slate-800 dark:to-blue-900/20">
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Title */}
        <div className="relative z-10 p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-foreground mb-2">Interactive Map</h3>
            <p className="text-sm text-muted-foreground">
              {locations.length} locations found • Click to view on Google Maps
            </p>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
            {[
              { type: "hotel", label: "Hotels", icon: Hotel },
              { type: "restaurant", label: "Restaurants", icon: Utensils },
            ].map((item) => {
              const count = locations.filter((l) => l.type === item.type).length
              return (
                <div
                  key={item.type}
                  className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm border border-border"
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${getIconColor(item.type)} text-white`}>
                    <item.icon className="h-3 w-3" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Location Markers Visualization */}
        <div className="relative z-20 w-full h-64 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            {/* Background elements */}
            <defs>
              <radialGradient id="markerGradient1" cx="30%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </radialGradient>
              <radialGradient id="markerGradient2" cx="30%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
              </radialGradient>
            </defs>

            {/* Marker points */}
            {locations.slice(0, 20).map((location, index) => {
              // Normalize coordinates to SVG space
              const x = ((location.lng + 180) / 360) * 800
              const y = ((90 - location.lat) / 180) * 400

              const isHotel = location.type === "hotel"
              const isSelected = selectedLocation === index
              const isHovered = hoveredLocation === index

              return (
                <g key={index}>
                  {/* Glow effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 20 : isHovered ? 18 : 15}
                    fill={isHotel ? "url(#markerGradient1)" : "url(#markerGradient2)"}
                    className="transition-all duration-200"
                  />
                  {/* Marker circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 8 : isHovered ? 7 : 6}
                    fill={isHotel ? "#3b82f6" : "#ef4444"}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedLocation(index)}
                    onMouseEnter={() => setHoveredLocation(index)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  />
                  {/* Label on hover */}
                  {isHovered && (
                    <text
                      x={x}
                      y={y - 25}
                      textAnchor="middle"
                      className="text-xs font-bold fill-foreground"
                      pointerEvents="none"
                    >
                      {location.name.substring(0, 20)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected Location Details */}
        {selectedLocation !== null && locations[selectedLocation] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mx-6 mb-6 rounded-lg bg-background/95 backdrop-blur-sm border-2 border-border p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${getIconColor(locations[selectedLocation].type)} text-white`}>
                    {getIcon(locations[selectedLocation].type)}
                  </div>
                  <h4 className="font-bold text-lg">{locations[selectedLocation].name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {getTypeLabel(locations[selectedLocation].type)}
                </p>
                {locations[selectedLocation].address && (
                  <p className="text-sm text-muted-foreground mb-2">{locations[selectedLocation].address}</p>
                )}
                {locations[selectedLocation].description && (
                  <p className="text-sm mb-3">{locations[selectedLocation].description}</p>
                )}
                {locations[selectedLocation].rating && (
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    ⭐ {locations[selectedLocation].rating} Rating
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => window.open(generateMapUrl(locations[selectedLocation].lat, locations[selectedLocation].lng, locations[selectedLocation].name), "_blank")}
                className="flex items-center gap-2"
              >
                View on Maps
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Location List */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-h-48 overflow-y-auto space-y-2">
            <h4 className="font-semibold text-sm text-foreground mb-3">
              Locations ({locations.length})
            </h4>
            {locations.slice(0, 12).map((location, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedLocation(index)}
                onMouseEnter={() => setHoveredLocation(index)}
                onMouseLeave={() => setHoveredLocation(null)}
                className={`w-full text-left p-3 rounded-lg cursor-pointer transition-all ${
                  selectedLocation === index
                    ? "bg-primary/20 border-2 border-primary"
                    : hoveredLocation === index
                      ? "bg-muted/80"
                      : "bg-muted/40 hover:bg-muted/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getIconColor(
                      location.type,
                    )} text-white text-xs`}
                  >
                    {location.type === "hotel" ? "H" : "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{location.address || location.description}</p>
                    {location.rating && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⭐ {location.rating}</p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
            {locations.length > 12 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{locations.length - 12} more locations
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
