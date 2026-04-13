"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Hotel, Utensils, ExternalLink, Loader } from "lucide-react"
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

declare global {
  interface Window {
    google: any
  }
}

export function InteractiveMap({
  locations,
  centerLat = 20,
  centerLng = 0,
  zoom = 8,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loadingMap, setLoadingMap] = useState(true)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true)
        return
      }

      const script = document.createElement("script")
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
      }
      script.onerror = () => {
        console.error("[v0] Failed to load Google Maps API")
        setLoadingMap(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map and add markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return

    setLoadingMap(true)

    try {
      // Create map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoom,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9c9c9" }],
          },
        ],
      })

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      // Add markers for each location
      locations.forEach((location, index) => {
        const isHotel = location.type === "hotel"
        const icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: isHotel ? "#3b82f6" : "#ef4444",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }

        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance.current,
          title: location.name,
          icon: icon,
        })

        // Create info window
        const infoContent = `
          <div style="padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold;">${location.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${
              location.type === "hotel" ? "🏨 Hotel" : "🍽️ Restaurant"
            }</p>
            ${location.rating ? `<p style="margin: 0 0 4px 0; font-size: 12px;">⭐ ${location.rating}</p>` : ""}
            ${location.address ? `<p style="margin: 0 0 4px 0; font-size: 12px;">${location.address}</p>` : ""}
          </div>
        `

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        })

        marker.addListener("click", () => {
          // Close all info windows
          markersRef.current.forEach((m: any) => {
            if (m.infoWindow) m.infoWindow.close()
          })
          infoWindow.open(mapInstance.current, marker)
          setSelectedLocation(index)
        })

        marker.infoWindow = infoWindow
        markersRef.current.push(marker)
      })

      setLoadingMap(false)
    } catch (error) {
      console.error("[v0] Error initializing map:", error)
      setLoadingMap(false)
    }
  }, [mapLoaded, locations, centerLat, centerLng, zoom])

  const generateMapUrl = (lat: number, lng: number, name: string) => {
    return `https://maps.google.com/?q=${lat},${lng}(${encodeURIComponent(name)})`
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getTypeIcon = (type: string) => {
    return type === "hotel" ? "🏨" : "🍽️"
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-border">
      {/* Map Container */}
      <div className="relative w-full bg-gray-200 dark:bg-gray-800">
        <div
          ref={mapRef}
          className="w-full min-h-96"
          style={{ width: "100%", height: "400px" }}
        />

        {loadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="flex flex-col items-center gap-2"
            >
              <Loader className="h-8 w-8 text-white" />
              <p className="text-white text-sm">Loading map...</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-card/50 backdrop-blur-sm border-t border-border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-1">Map Information</h3>
          <p className="text-sm text-muted-foreground">
            {locations.length} locations • Click markers to view details
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { type: "hotel", label: "Hotels", icon: Hotel, count: locations.filter((l) => l.type === "hotel").length },
            { type: "restaurant", label: "Restaurants", icon: Utensils, count: locations.filter((l) => l.type === "restaurant").length },
          ].map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 text-sm border border-border"
            >
              <div className={`flex h-4 w-4 rounded-full ${item.type === "hotel" ? "bg-blue-500" : "bg-red-500"}`} />
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">({item.count})</span>
            </div>
          ))}
        </div>

        {/* Selected Location Details */}
        {selectedLocation !== null && locations[selectedLocation] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getTypeIcon(locations[selectedLocation].type)}</span>
                  <h4 className="font-bold text-base">{locations[selectedLocation].name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{getTypeLabel(locations[selectedLocation].type)}</p>
                {locations[selectedLocation].address && (
                  <p className="text-sm text-muted-foreground mb-2">{locations[selectedLocation].address}</p>
                )}
                {locations[selectedLocation].description && (
                  <p className="text-sm mb-2">{locations[selectedLocation].description}</p>
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
                className="flex items-center gap-2 flex-shrink-0"
              >
                View on Maps
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Locations List */}
        <div className="mt-6">
          <h4 className="font-semibold text-sm mb-3">All Locations ({locations.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {locations.map((location, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  setSelectedLocation(index)
                  // Pan to marker
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: location.lat, lng: location.lng })
                    mapInstance.current.setZoom(12)
                  }
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedLocation === index ? "bg-primary/20 border-2 border-primary" : "bg-muted/40 hover:bg-muted/60 border border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{getTypeIcon(location.type)}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
