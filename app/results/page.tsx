"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"
import { getCountryFlagUrl } from "@/lib/destination-image-generator"
import { getDestinationImage } from "@/lib/destination-images"

interface AnalysisResults {
  countries: Array<{
    name: string
    matchPercentage: number
    reason: string
    image: string
    tags: string[]
    climate: string
    vibe: string
  }>
  summary: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({})
  const { t } = useLanguage()

  useEffect(() => {
    const loadData = async () => {
      const storedResults = sessionStorage.getItem("analysisResults")
      if (storedResults) {
        try {
          const parsed = JSON.parse(storedResults)
          console.log("[v0] Loading results, generating fresh category images per country")
          
          // Ensure we have countries array
          if (parsed.countries) {
            // Fetch real destination images from Pexels for each destination card
            const countriesWithImages = await Promise.all(
              parsed.countries.map(async (country: any, index: number) => {
                try {
                  // Fetch image for this specific destination from Pexels
                  const destImageUrl = await getDestinationImage(country.name)
                  console.log(`[v0] Fetched destination image for ${country.name}:`, destImageUrl)
                  
                  return {
                    ...country,
                    image: destImageUrl || country.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
                  }
                } catch (imgError) {
                  console.error(`[v0] Error fetching image for ${country.name}:`, imgError)
                  return {
                    ...country,
                    image: country.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
                  }
                }
              })
            )
            setResults({
              ...parsed,
              countries: countriesWithImages,
            })
          } else if (parsed.suggestedCountry) {
            const destImageUrl = await getDestinationImage(parsed.suggestedCountry.name)
            setResults({
              countries: [
                {
                  name: parsed.suggestedCountry.name,
                  matchPercentage: parsed.suggestedCountry.confidence * 100,
                  reason: parsed.summary,
                  image: destImageUrl || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
                  tags: parsed.inferredFromImages || [],
                  climate: "Temperate",
                  vibe: "Cultural",
                },
              ],
              summary: parsed.summary,
            })
          }
        } catch (error) {
          console.error("[v0] Error parsing results:", error)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No results found. Please upload images first.</p>
          <Button asChild>
            <Link href="/upload">Start Over</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>

          <h1 className="mb-4 text-balance text-5xl font-bold md:text-6xl">
            Your Perfect Destinations
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Based on your travel preferences, here are three destinations perfectly matched for you.
          </p>
        </motion.div>

        {/* 3-Country Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {results.countries.slice(0, 3).map((country, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedCountry(index)}
              className="cursor-pointer"
            >
              <Card
                className={`h-full overflow-hidden border-2 transition-all duration-300 ${
                  selectedCountry === index
                    ? "border-primary shadow-xl shadow-primary/50 ring-2 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Country Image with Flag Overlay */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary">
                  <img
                    src={country.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                    alt={country.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                    }}
                  />

                  {/* Flag Badge - Inside Image Container */}
                  <div className="absolute left-4 bottom-4 h-12 w-16 rounded border-2 border-white shadow-lg overflow-hidden">
                    <img
                      src={getCountryFlagUrl(country.name)}
                      alt={`${country.name} flag`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://flagsapi.com/XX/flat/64.png"
                      }}
                    />
                  </div>

                  {/* Match Badge */}
                  <div className="absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    {Math.round(country.matchPercentage)}%
                  </div>

                  {/* Rank Badge */}
                  <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white font-bold">
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="mb-3 text-2xl font-bold">{country.name}</h2>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Climate:</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.climate}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Vibe:</span>
                      <Badge variant="secondary" className="text-xs">
                        {country.vibe}
                      </Badge>
                    </div>
                  </div>

                  <p className="mb-4 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {country.reason}
                  </p>

                  {country.tags && country.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {country.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Link href={`/destination/${index}`} className="flex items-center justify-between">
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Summary */}
        {results.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 bg-gradient-to-br from-primary/10 via-card/50 to-card/50 p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Why These Destinations?</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{results.summary}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/upload">Try Again</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
