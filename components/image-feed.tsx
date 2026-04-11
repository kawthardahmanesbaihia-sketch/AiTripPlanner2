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

export function ImageFeed({ onImagesSelected }: ImageFeedProps) {
  const [images, setImages] = useState<FeedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const observerTarget = useRef<HTMLDivElement>(null)
  const pageRef = useRef(0)
  const hasLoadedRef = useRef(false)

  // Fetch images from API (no categories)
  const fetchImages = useCallback(async (page: number) => {
    try {
      const response = await fetch("/api/discover-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, count: 12 }),
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Failed to fetch images")
      const data = await response.json()

      // Add random aspect ratios for masonry effect
      return (data.images || []).map((img: FeedImage) => ({
        ...img,
        aspectRatio: [0.75, 0.85, 0.95, 1, 1.1, 1.2, 1.3, 1.5][Math.floor(Math.random() * 8)],
      }))
    } catch (error) {
      console.error("[v0] Error fetching images:", error)
      return []
    }
  }, [])

  // Load more images
  const loadMoreImages = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const newImages = await fetchImages(pageRef.current)
      setImages((prev) => [...prev, ...newImages])
      pageRef.current += 1
    } catch (error) {
      console.error("[v0] Error loading more images:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, fetchImages])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
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
  }, [loadMoreImages, isLoading])

  // Initial load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadMoreImages()
    }
  }, [loadMoreImages])

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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
        {images.map((image, idx) => (
          <motion.div
            key={`${image.url}-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4 break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => toggleImageSelection(idx)}
          >
            {/* Image Container */}
            <div
              className="relative overflow-hidden rounded-2xl bg-muted"
              style={{ aspectRatio: image.aspectRatio || 1 }}
            >
              <img
                src={image.url}
                alt="Travel inspiration"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedImages.has(idx)
                      ? "border-white bg-primary"
                      : "border-white bg-transparent"
                  }`}
                >
                  {selectedImages.has(idx) && (
                    <Check className="w-7 h-7 text-white" />
                  )}
                </motion.div>
              </motion.div>

              {/* Selection Indicator Badge */}
              {selectedImages.has(idx) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary border-2 border-white shadow-lg"
                >
                  <Check className="h-5 w-5 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div ref={observerTarget} className="flex justify-center py-16">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        )}
      </div>
    </div>
  )
}
