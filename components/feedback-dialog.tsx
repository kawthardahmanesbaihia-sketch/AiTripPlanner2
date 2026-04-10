"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface FeedbackDialogProps {
  activityName: string
  day?: number
  onFeedback: (rating: "loved" | "ok" | "not-for-me") => void
  onClose: () => void
}

export function FeedbackDialog({ activityName, day, onFeedback, onClose }: FeedbackDialogProps) {
  const { t, language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show dialog after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleFeedback = (rating: "loved" | "ok" | "not-for-me") => {
    onFeedback(rating)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const questionText = {
    en: day ? `How was your visit to ${activityName} on Day ${day}?` : `How would you rate ${activityName}?`,
    fr: day
      ? `Comment s'est passée votre visite à ${activityName} le jour ${day}?`
      : `Comment évalueriez-vous ${activityName}?`,
    ar: day ? `كيف كانت زيارتك إلى ${activityName} في اليوم ${day}؟` : `كيف تقيم ${activityName}؟`,
  }

  const helpText = {
    en: "Your feedback helps us personalize your future adventures!",
    fr: "Vos commentaires nous aident à personnaliser vos futures aventures!",
    ar: "ملاحظاتك تساعدنا في تخصيص مغامراتك المستقبلية!",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-md"
          >
            <Card className="overflow-hidden border-2 border-primary/30 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Question */}
              <div className="mb-6 pr-8">
                <h3
                  className={`text-balance text-lg font-semibold leading-tight ${language === "ar" ? "text-right" : ""}`}
                >
                  {questionText[language]}
                </h3>
              </div>

              {/* Feedback Buttons */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleFeedback("loved")}
                    variant="outline"
                    className="h-auto w-full flex-col gap-2 border-2 py-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                    <span className="text-xs font-semibold">
                      {language === "en" && "I loved it"}
                      {language === "fr" && "J'ai adoré"}
                      {language === "ar" && "أحببته"}
                    </span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleFeedback("ok")}
                    variant="outline"
                    className="h-auto w-full flex-col gap-2 border-2 py-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <ThumbsUp className="h-6 w-6 text-blue-500" />
                    <span className="text-xs font-semibold">
                      {language === "en" && "It was OK"}
                      {language === "fr" && "C'était bien"}
                      {language === "ar" && "كان جيداً"}
                    </span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleFeedback("not-for-me")}
                    variant="outline"
                    className="h-auto w-full flex-col gap-2 border-2 py-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <ThumbsDown className="h-6 w-6 text-orange-500" />
                    <span className="text-xs font-semibold">
                      {language === "en" && "Not for me"}
                      {language === "fr" && "Pas pour moi"}
                      {language === "ar" && "ليس لي"}
                    </span>
                  </Button>
                </motion.div>
              </div>

              {/* Help text */}
              <p
                className={`text-center text-xs leading-relaxed text-muted-foreground ${language === "ar" ? "text-right" : ""}`}
              >
                {helpText[language]}
              </p>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
