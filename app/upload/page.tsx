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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/40 py-6 px-4 sm:px-6 lg:px-8 z-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-balance">
                  Discover Your Travel Inspiration
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  Click images to select your favorites, then tell us about your trip
                </p>
              </div>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold"
                >
                  {selectedCount}
                </motion.div>
              )}
            </div>

            {/* Selection Counter and Input Section */}
            {selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground">Budget</label>
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
                          className={`px-2 py-1.5 rounded text-sm font-medium transition-all border ${budget === option.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                            }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2 text-muted-foreground">Travel Dates</label>
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
                        className="w-full px-3 py-1.5 rounded text-sm border border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left"
                      >
                        {travelDates
                          ? `${travelDates.start.toDateString()} → ${travelDates.end.toDateString()}`
                          : "Select dates"}
                      </motion.button>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !budget || !travelDates}
                      size="sm"
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Discover
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Image Feed */}
        <div className="py-8">
          <ImageFeed onImagesSelected={handleImagesSelected} />
        </div>
      </div>
    </div>
  )
}
