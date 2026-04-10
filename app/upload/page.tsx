"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Check,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"
import { AIThinkingAnimation } from "@/components/ai-thinking-animation"
import { DateRangePicker } from "@/components/date-range-picker"
import { Sparkles } from "lucide-react"


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
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [budget, setBudget] = useState("")
  const [travelDates, setTravelDates] = useState<{ start: Date; end: Date } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const router = useRouter()
  const { t, language } = useLanguage()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setUploadedImages((prev) => [
          ...prev,
          {
            url: imageUrl,
            source: "upload" as const,
            file,
            selected: true,
            tags: [],
            mood: "neutral",
            climate: "temperate",
            environment: "urban",
            activity_level: "medium",
            food_style: "casual",
            category: "user-upload",
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const toggleImageSelection = (imageIndex: number) => {
    setUploadedImages((prev) => {
      const updated = [...prev]
      updated[imageIndex] = {
        ...updated[imageIndex],
        selected: !updated[imageIndex].selected,
      }
      return updated
    })
  }

  const removeImage = (imageIndex: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== imageIndex))
  }

  const getSelectedImages = (): ImageItem[] => {
    return uploadedImages.filter((img) => img.selected)
  }

  const getTotalSelectedImages = () => {
    return getSelectedImages().length
  }

  const handleAnalyze = async () => {
    const totalSelected = getTotalSelectedImages()
    if (totalSelected < 1 || !budget || !travelDates) {
      return
    }

    setIsAnalyzing(true)

    const selectedImages = getSelectedImages()
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
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />
      {isAnalyzing && <AIThinkingAnimation />}

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-balance text-5xl font-bold md:text-6xl">
            Explore Your Travel Style
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Upload images that inspire you. Our AI will understand your unique travel preferences.
          </p>
        </motion.div>

        {/* Image Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-12">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Upload Your Images</h2>
                <p className="text-muted-foreground">Select one or more images from your device</p>
              </div>

              <label className="cursor-pointer w-full">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="text-primary text-4xl">📸</div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Click to upload images</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </div>
                </div>
              </label>
            </div>
          </Card>
        </motion.div>

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Your Images ({uploadedImages.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {uploadedImages.map((img, imgIndex) => (
                <motion.div
                  key={imgIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: imgIndex * 0.05 }}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${img.selected
                      ? "border-primary shadow-lg shadow-primary/50 scale-105"
                      : "border-border hover:border-primary/50"
                    }`}
                  onClick={() => toggleImageSelection(imgIndex)}
                >
                  <img
                    src={img.url}
                    alt={`Uploaded image ${imgIndex + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  {img.selected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-6 w-6" />
                      </div>
                    </motion.div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(imgIndex)
                    }}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/80 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selection Counter and Minimal Inputs */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedCount} Image{selectedCount !== 1 ? 's' : ''} Selected</h2>
                  <p className="text-muted-foreground">
                    Great! Now tell us a bit more about your trip.
                  </p>
                </div>
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {selectedCount}
                </motion.div>
              </div>

              {selectedCount >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Budget</label>
                      <div className="grid grid-cols-2 gap-2">
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
                            className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${budget === option.value
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
                      <label className="block text-sm font-semibold mb-2">Travel Dates</label>
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
                          className="w-full px-4 py-3 rounded-lg border-2 border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left"
                        >
                          {travelDates
                            ? `${travelDates.start.toDateString()} → ${travelDates.end.toDateString()}`
                            : "Click to select travel dates"}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !budget || !travelDates}
                      size="lg"
                      className="w-full shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing your preferences...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Discover My Perfect Trip
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
