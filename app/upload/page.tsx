"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
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

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackgroundElements />
      {isAnalyzing && <AIThinkingAnimation />}

      <div className="relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10 border-b border-border/40 bg-gradient-to-b from-background to-background/50"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-2">
              Discover Your Travel Style
            </h1>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl">
              Explore millions of travel inspiration images. Click to select your favorites.
            </p>
          </div>
        </motion.div>

        {/* Image Feed */}
        <div className="py-8 sm:py-12">
          <ImageFeed onImagesSelected={handleImagesSelected} />
        </div>

        {/* Bottom Control Panel - Fixed when images selected */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/95 backdrop-blur-md z-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                {/* Selection Counter */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {selectedCount}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedCount} Image{selectedCount !== 1 ? "s" : ""} Selected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tell us about your trip
                    </p>
                  </div>
                </motion.div>

                {/* Controls */}
                <div className="flex-1 sm:flex-none flex items-center gap-2 sm:gap-3">
                  {/* Budget Selector */}
                  <div className="hidden sm:flex gap-2">
                    {[
                      { value: "low", label: "Budget" },
                      { value: "medium", label: "Standard" },
                      { value: "high", label: "Premium" },
                      { value: "luxury", label: "Luxury" },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBudget(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                          budget === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Date Picker */}
                  <div className="hidden sm:block">
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
                        className="px-3 py-1.5 rounded-lg text-xs sm:text-sm border border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left whitespace-nowrap"
                      >
                        {travelDates
                          ? `${travelDates.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} → ${travelDates.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                          : "Pick dates"}
                      </motion.button>
                    )}
                  </div>

                  {/* Discover Button */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !budget || !travelDates}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Analyzing</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Discover</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Controls (shown below on small screens) */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="sm:hidden mt-4 pt-4 border-t border-border/40 space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold mb-2 text-muted-foreground">Budget</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "low", label: "Budget" },
                      { value: "medium", label: "Standard" },
                      { value: "high", label: "Premium" },
                      { value: "luxury", label: "Luxury" },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBudget(option.value)}
                        className={`px-2 py-1.5 rounded text-xs font-medium transition-all border ${
                          budget === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {option.label.split(" ")[0]}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 text-muted-foreground">Dates</label>
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
                      className="w-full px-3 py-2 rounded-lg text-xs border border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left"
                    >
                      {travelDates
                        ? `${travelDates.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} → ${travelDates.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                        : "Select dates"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Bottom Padding to prevent content overlap */}
        {selectedCount > 0 && <div className="h-32 sm:h-28" />}
      </div>
    </div>
  )
}
