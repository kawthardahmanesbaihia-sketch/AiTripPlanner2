"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2, Check } from "lucide-react"

interface FeedImage {
  url: string
  source: "upload" | "ai"
  file?: File
  selected?: boolean
  tags?: string[]
  mood?: string
  climate?: string
  environment?: string
  activity_level?: string
  food_style?: string
  category?: string
  aspectRatio?: number
}

interface ImageFeedProps {
  onImagesSelected: (images: FeedImage[]) => void
}

const ASPECT_RATIOS = [0.75, 0.85, 0.95, 1, 1.1, 1.25, 1.4, 1.6]

export function ImageFeed({ onImagesSelected }: ImageFeedProps) {
  const [images, setImages] = useState<FeedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const pageRef = useRef(0)
  const hasLoadedRef = useRef(false)

  // Fetch images from API
  const fetchImages = useCallback(async (page: number) => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/discover-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, count: 12 }),
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Failed to fetch images")
      const data = await response.json()

      // Add random aspect ratios and metadata for masonry effect
      const newImages = (data.images || []).map((img: FeedImage, idx: number) => ({
        ...img,
        aspectRatio: ASPECT_RATIOS[Math.floor(Math.random() * ASPECT_RATIOS.length)],
        tags: img.tags || [],
        mood: img.mood || "neutral",
        climate: img.climate || "temperate",
        environment: img.environment || "outdoor",
        activity_level: img.activity_level || "medium",
        food_style: img.food_style || "casual",
        category: "discovery",
      }))

      setImages((prev) => [...prev, ...newImages])
      setHasMore(newImages.length === 12)
    } catch (error) {
      console.error("[v0] Error fetching images:", error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore])

  // Initial load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      fetchImages(0)
    }
  }, [fetchImages])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          pageRef.current += 1
          fetchImages(pageRef.current)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [fetchImages, hasMore, isLoading])

  // Toggle selection
  const toggleSelect = useCallback((index: number) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      
      // Update parent with selected images
      const selected = Array.from(newSet).map((idx) => images[idx])
      onImagesSelected(selected)
      
      return newSet
    })
  }, [images, onImagesSelected])

  return (
    <div className="w-full">
      {/* Masonry Grid */}
      <div className="columns-2 gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8 md:columns-3 lg:columns-4 xl:columns-4">
        {images.map((image, index) => (
          <motion.div
            key={`${image.url}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="mb-4 break-inside-avoid sm:mb-6 cursor-pointer group relative overflow-hidden rounded-lg"
            style={{ aspectRatio: image.aspectRatio }}
            onClick={() => toggleSelect(index)}
          >
            {/* Image */}
            <div className="relative w-full h-full overflow-hidden bg-muted">
              <img
                src={image.url}
                alt={`Discovery image ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

              {/* Selection checkbox */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  selectedImages.has(index)
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.8, opacity: 0 }
                }
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4"
              >
                <div
                  className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedImages.has(index)
                      ? "bg-blue-500 border-blue-500"
                      : "border-white/80 bg-white/10 backdrop-blur-sm"
                  }`}
                >
                  {selectedImages.has(index) && (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8 sm:py-12">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-4" />

      {/* End of feed message */}
      {!hasMore && images.length > 0 && (
        <div className="py-8 sm:py-12 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">No more images to load</p>
        </div>
      )}
    </div>
  )
}
