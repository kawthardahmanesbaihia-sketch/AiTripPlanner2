"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

const CATEGORIES = [
  "nature",
  "city",
  "activities",
  "food",
  "beaches",
  "culture",
  "hidden",
  "nightlife",
  "luxury",
  "adventure",
]

export function ImageFeed({ onImagesSelected }: ImageFeedProps) {
  const [images, setImages] = useState<FeedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadedCategoriesRef = useRef<Set<string>>(new Set())
  const requestCountRef = useRef(0)

  // Fetch images from API
  const fetchImagesFromCategory = useCallback(async (category: string) => {
    if (loadedCategoriesRef.current.has(category)) return []

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: 6 }),
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Failed to fetch images")
      const data = await response.json()

      loadedCategoriesRef.current.add(category)

      // Add random aspect ratios for masonry effect
      return (data.images || []).map((img: FeedImage) => ({
        ...img,
        aspectRatio: [0.75, 0.9, 1, 1.2, 1.5][Math.floor(Math.random() * 5)],
      }))
    } catch (error) {
      console.error(`[v0] Error fetching images from ${category}:`, error)
      return []
    }
  }, [])

  // Load more images function
  const loadMoreImages = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      // Load images from different categories in sequence
      const startIdx = requestCountRef.current
      const categoriesToLoad = CATEGORIES.slice(
        startIdx,
        startIdx + 2
      )

      if (categoriesToLoad.length === 0) {
        setHasMore(false)
        setIsLoading(false)
        return
      }

      requestCountRef.current += 2

      const newImages: FeedImage[] = []
      for (const category of categoriesToLoad) {
        const categoryImages = await fetchImagesFromCategory(category)
        newImages.push(...categoryImages)
      }

      setImages((prev) => [...prev, ...newImages])

      if (requestCountRef.current >= CATEGORIES.length) {
        setHasMore(true) // Allow cycling through categories again
        requestCountRef.current = 0
        loadedCategoriesRef.current.clear()
      }
    } catch (error) {
      console.error("[v0] Error loading more images:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, fetchImagesFromCategory])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreImages()
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTarget.current
    if (target) observer.observe(target)

    return () => {
      if (target) observer.unobserve(target)
    }
  }, [loadMoreImages, isLoading, hasMore])

  // Initial load
  useEffect(() => {
    loadMoreImages()
  }, [])

  // Toggle image selection
  const toggleImageSelection = (imageIndex: number) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageIndex)) {
      newSelected.delete(imageIndex)
    } else {
      newSelected.add(imageIndex)
    }
    setSelectedImages(newSelected)

    // Notify parent of selection
    const selected = Array.from(newSelected)
      .map((idx) => images[idx])
      .filter(Boolean)
    onImagesSelected(selected)
  }

  return (
    <div className="w-full">
      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 px-4 sm:px-6 lg:px-8">
        {images.map((image, idx) => (
          <motion.div
            key={`${image.url}-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4 break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer"
            onClick={() => toggleImageSelection(idx)}
          >
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-auto">
              <img
                src={image.url}
                alt="Travel inspiration"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-white text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    {selectedImages.has(idx) && (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                  <p className="text-sm font-medium mt-2">
                    {selectedImages.has(idx) ? "Selected" : "Select"}
                  </p>
                </div>
              </motion.div>

              {/* Selection Indicator */}
              {selectedImages.has(idx) && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div ref={observerTarget} className="flex justify-center py-12">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        )}
      </div>

      {/* End of Feed Message */}
      {!hasMore && images.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            End of feed. Keep scrolling for more inspiration!
          </p>
          <Button
            variant="outline"
            onClick={() => {
              loadedCategoriesRef.current.clear()
              requestCountRef.current = 0
              setImages([])
              loadMoreImages()
            }}
          >
            Refresh Feed
          </Button>
        </motion.div>
      )}
    </div>
  )
}
