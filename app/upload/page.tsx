"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"
import { AIThinkingAnimation } from "@/components/ai-thinking-animation"
import { DateRangePicker } from "@/components/date-range-picker"
import { ImageFeed } from "@/components/image-feed"

interface ImageItem {
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
}

export default function UploadPage() {
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [budget, setBudget] = useState("")
  const [travelDates, setTravelDates] = useState<{ start: Date; end: Date } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()

  const handleImagesSelected = (images: ImageItem[]) => {
    setSelectedImages(images)
  }

  const getTotalSelectedImages = () => {
    return selectedImages.length
  }

  const handleAnalyze = async () => {
    const totalSelected = getTotalSelectedImages()
    if (totalSelected < 1 || !budget || !travelDates) {
      return
    }

    setIsAnalyzing(true)

    const allTags: string[] = []
    const allMetadata: any[] = []

    selectedImages.forEach((img) => {
      if (img.tags) {
        allTags.push(...img.tags)
      }
      allMetadata.push({
        tags: img.tags,
        mood: img.mood,
        climate: img.climate,
        environment: img.environment,
        activity_level: img.activity_level,
        food_style: img.food_style,
        category: img.category,
      })
    })

    try {
      // Generate seed for consistent randomization across this request
      const requestSeed = Date.now() + Math.random() * 1000000

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageTags: allTags,
          imageMetadata: allMetadata,
          preferences: {
            budget,
            travelDates: {
              start: travelDates.start.toISOString(),
              end: travelDates.end.toISOString(),
            },
          },
          language,
          seed: requestSeed,
        }),
        cache: "no-store",
      })

      const data = await response.json()
      // Store seed for use in destination API calls
      sessionStorage.setItem("analysisResults", JSON.stringify({ ...data, seed: data.requestSeed || requestSeed }))
      sessionStorage.setItem("travelDates", JSON.stringify(travelDates))
      sessionStorage.setItem("requestSeed", String(data.requestSeed || requestSeed))

      setTimeout(() => {
        router.push("/results")
      }, 1500)
    } catch (error) {
      console.error("[v0] Error analyzing images:", error)
      setIsAnalyzing(false)
    }
  }

  const selectedCount = getTotalSelectedImages()
  const isReadyToAnalyze = selectedCount > 0 && budget && travelDates

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <AnimatedBackgroundElements />
      {isAnalyzing && <AIThinkingAnimation />}

      <div className="relative z-10 w-full">
        {/* Hero Header - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30 py-6 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                  Discover Your Travel Inspiration
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2">
                  Click images you love. Then tell us about your trip.
                </p>
              </div>

              {/* Selection Badge */}
              <AnimatePresence>
                {selectedCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex-shrink-0"
                  >
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-blue-500 text-white text-base sm:text-lg font-bold shadow-lg">
                      {selectedCount}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Image Feed - Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-8 sm:py-12"
        >
          <ImageFeed onImagesSelected={handleImagesSelected} />
        </motion.div>

        {/* Fixed Bottom Control Panel */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-md shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Expandable Content */}
                {!showPanel ? (
                  <motion.button
                    onClick={() => setShowPanel(true)}
                    className="w-full flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-foreground">{selectedCount} image{selectedCount !== 1 ? 's' : ''} selected</div>
                      <div className="text-sm text-muted-foreground">Add details to discover your trip</div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Collapse Header */}
                    <motion.button
                      onClick={() => setShowPanel(false)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="text-lg font-bold text-foreground">{selectedCount} image{selectedCount !== 1 ? 's' : ''} selected</div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground rotate-180" />
                    </motion.button>

                    {/* Form Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Budget */}
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
                          Budget
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "low", label: "Budget" },
                            { value: "medium", label: "Standard" },
                            { value: "high", label: "Premium" },
                            { value: "luxury", label: "Luxury" },
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setBudget(option.value)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                budget === option.value
                                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "border-border hover:border-blue-300/50 hover:bg-muted"
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Travel Dates */}
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
                          Travel Dates
                        </label>
                        {showDatePicker ? (
                          <DateRangePicker
                            onDateRangeChange={(startDate, endDate) => {
                              setTravelDates({ start: startDate, end: endDate })
                              setShowDatePicker(false)
                            }}
                          />
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowDatePicker(true)}
                            className="w-full px-3 py-2 rounded-lg text-sm border border-border hover:border-blue-300/50 hover:bg-muted bg-card text-foreground font-medium transition-all text-left"
                          >
                            {travelDates
                              ? `${travelDates.start.toDateString()} → ${travelDates.end.toDateString()}`
                              : "Click to select"}
                          </motion.button>
                        )}
                      </div>

                      {/* Discover Button */}
                      <div className="flex flex-col justify-end">
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !isReadyToAnalyze}
                          size="lg"
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Discover My Trip
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Padding for fixed bottom panel */}
        {selectedCount > 0 && <div className="h-24 sm:h-32" />}
      </div>
    </div>
  )
}
