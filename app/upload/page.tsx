"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ImageFeed } from "@/components/image-feed"

interface ImageItem {
  url: string
  source: "upload" | "ai"
  selected?: boolean
  tags?: string[]
  category?: string
}

export default function UploadPage() {
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const router = useRouter()

  const handleImagesSelected = (images: ImageItem[]) => {
    setSelectedImages(images)
  }

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: selectedImages,
        }),
      })

      const data = await response.json()

      sessionStorage.setItem("analysisResults", JSON.stringify(data))

      setTimeout(() => {
        router.push("/results")
      }, 1200)
    } catch (error) {
      console.error(error)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b p-6">
        <h1 className="text-3xl font-bold">
          Discover Inspiration
        </h1>
        <p className="text-muted-foreground">
          Scroll like Pinterest. Click what you like.
        </p>
      </div>

      {/* FEED (NO CATEGORIES ANYMORE) */}
      <ImageFeed onImagesSelected={handleImagesSelected} />

      {/* Bottom bar */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-4 flex justify-between items-center"
          >
            <div className="font-medium">
              {selectedImages.length} selected
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isAnalyzing ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Discover Trip
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}