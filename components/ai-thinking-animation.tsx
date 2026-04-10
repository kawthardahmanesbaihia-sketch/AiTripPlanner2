"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

const thinkingMessages = [
  "Analyzing visual preferences...",
  "Understanding travel personality...",
  "Matching destinations...",
  "Calculating match scores...",
  "Generating recommendations...",
]

export function AIThinkingAnimation() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center space-y-6"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity },
          }}
          className="mx-auto"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </motion.div>

        {/* Text Animation */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">AtlasMind is Thinking</h2>

          {/* Animated message list */}
          <div className="h-8 overflow-hidden">
            <motion.div
              animate={{ y: -200 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="space-y-8"
            >
              {thinkingMessages.map((message, index) => (
                <p key={index} className="text-lg text-muted-foreground">
                  {message}
                </p>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: Infinity,
              }}
              className="h-3 w-3 rounded-full bg-primary"
            />
          ))}
        </div>

        {/* Progress Text */}
        <p className="text-sm text-muted-foreground">
          This usually takes 2-5 seconds
        </p>
      </motion.div>
    </div>
  )
}
