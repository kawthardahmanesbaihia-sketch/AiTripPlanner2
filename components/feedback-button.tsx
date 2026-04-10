"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

interface FeedbackButtonProps {
  itemName: string
  itemType: "hotel" | "restaurant" | "activity" | "event"
  day?: number
}

export function FeedbackButton({ itemName, itemType, day }: FeedbackButtonProps) {
  const [feedback, setFeedback] = useState<"loved" | "ok" | "not-for-me" | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const { language } = useLanguage()

  const handleFeedback = (rating: "loved" | "ok" | "not-for-me") => {
    setFeedback(rating)
    setShowOptions(false)

    // Store feedback
    const existingFeedback = localStorage.getItem("tripFeedback")
    const feedbackData = existingFeedback ? JSON.parse(existingFeedback) : []

    feedbackData.push({
      itemName,
      itemType,
      day,
      rating,
      timestamp: new Date().toISOString(),
    })

    localStorage.setItem("tripFeedback", JSON.stringify(feedbackData))
    console.log("[v0] Feedback saved:", { itemName, itemType, rating })
  }

  const feedbackText = {
    en: feedback === "loved" ? "Loved it!" : feedback === "ok" ? "It was OK" : "Not for me",
    fr: feedback === "loved" ? "Adoré!" : feedback === "ok" ? "C'était bien" : "Pas pour moi",
    ar: feedback === "loved" ? "أحببته!" : feedback === "ok" ? "كان جيداً" : "ليس لي",
  }

  const promptText = {
    en: "Rate this",
    fr: "Évaluer",
    ar: "قيم هذا",
  }

  if (feedback) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {feedback === "loved" && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
        {feedback === "ok" && <ThumbsUp className="h-3 w-3 text-blue-500" />}
        {feedback === "not-for-me" && <ThumbsDown className="h-3 w-3 text-orange-500" />}
        <span>{feedbackText[language]}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {!showOptions ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(true)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          {promptText[language]}
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback("loved")}
            className="rounded p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-950"
            title={language === "en" ? "I loved it" : language === "fr" ? "J'ai adoré" : "أحببته"}
          >
            <Heart className="h-4 w-4 text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback("ok")}
            className="rounded p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-950"
            title={language === "en" ? "It was OK" : language === "fr" ? "C'était bien" : "كان جيداً"}
          >
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFeedback("not-for-me")}
            className="rounded p-1 transition-colors hover:bg-orange-100 dark:hover:bg-orange-950"
            title={language === "en" ? "Not for me" : language === "fr" ? "Pas pour moi" : "ليس لي"}
          >
            <ThumbsDown className="h-4 w-4 text-orange-500" />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
