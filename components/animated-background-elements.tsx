"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackgroundElements() {
  const [dots, setDots] = useState<{ left: string; top: string; duration: number; delay: number }[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
    setDots(generated)
  }, [])

  return (
    <>
      {/* Animated gradient orbs */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Large gradient orb - top left */}
        <motion.div
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        {/* Medium gradient orb - right */}
        <motion.div
          className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-chart-2/20 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 2,
          }}
        />

        {/* Small gradient orb - bottom */}
        <motion.div
          className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-chart-4/20 blur-[80px]"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 4,
          }}
        />
      </motion.div>

      {/* Floating dots pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-30">
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary"
            style={{
              left: dot.left,
              top: dot.top,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: dot.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: dot.delay,
            }}
          />
        ))}
      </div>
    </>
  )
}
