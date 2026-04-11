"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Check } from "lucide-react"

interface FeedImage {
  url: string
  source: "upload" | "ai"
  selected?: boolean
}

interface Props {
  onImagesSelected: (images: FeedImage[]) => void
}

const RATIOS = [0.7, 0.85, 1, 1.15, 1.3, 1.5]

export function ImageFeed({ onImagesSelected }: Props) {
  const [images, setImages] = useState<FeedImage[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  const fetchImages = async (pageNum: number) => {
    setLoading(true)

    try {
      const res = await fetch("/api/discover-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pageNum, count: 20 }),
      })

      const data = await res.json()

      const newImages = (data.images || []).map((img: FeedImage) => ({
        ...img,
        aspect: RATIOS[Math.floor(Math.random() * RATIOS.length)],
      }))

      setImages((prev) => {
        const combined = [...prev, ...newImages]

        // إزالة التكرار
        return Array.from(new Map(combined.map(i => [i.url, i])).values())
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // أول تحميل
  useEffect(() => {
    fetchImages(0)
  }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchImages(next)
  }

  const toggle = (index: number) => {
    const newSet = new Set(selected)

    if (newSet.has(index)) newSet.delete(index)
    else newSet.add(index)

    setSelected(newSet)

    const selectedImages = Array.from(newSet).map(i => images[i])
    onImagesSelected(selectedImages)
  }

  return (
    <div className="w-full">

      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 p-4 space-y-4">
        {images.map((img, i) => (
          <motion.div
            key={img.url + i}
            className="relative break-inside-avoid cursor-pointer group"
            style={{ aspectRatio: img.aspect }}
            onClick={() => toggle(i)}
          >
            <img
              src={img.url}
              className="w-full rounded-xl object-cover"
            />

            <div className="absolute inset-0 group-hover:bg-black/20 rounded-xl transition" />

            {selected.has(i) && (
              <div className="absolute top-2 right-2 bg-blue-500 p-1 rounded-full">
                <Check className="text-white w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* زر Show More */}
      <div className="flex justify-center py-6">
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-black text-white hover:opacity-90 transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Loading...
            </span>
          ) : (
            "Show More"
          )}
        </button>
      </div>
    </div>
  )
}