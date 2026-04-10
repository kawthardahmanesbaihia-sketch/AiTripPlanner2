"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plane, Map, EarthIcon,Camera, Compass, MapPin, Globe } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const { t } = useLanguage()

  // Initialize with safe defaults, will update on client side
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [mouseX, mouseY, setWindowSize])

  const x1 = useTransform(mouseX, [0, windowSize.width], [-20, 20])
  const y1 = useTransform(mouseY, [0, windowSize.height], [-20, 20])
  const x2 = useTransform(mouseX, [0, windowSize.width], [-10, 10])
  const y2 = useTransform(mouseY, [0, windowSize.height], [-10, 10])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackgroundElements />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20 text-background bg-card">
        <div className="container relative z-10 mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 inline-block"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Plane className="text-primary w-96 h-20" />
            </motion.div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
                {t("aiDrivenVisual")}
              </span>
              <br />
              <span className="text-foreground">{t("tripPlanner")}</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              {t("uploadYourImages")}
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
              >
                <Link href="/auth">
                  {t("startNow")}
                  <Map className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Icons */}
          <motion.div className="absolute left-[10%] top-[20%] opacity-20" style={{ x: x1, y: y1 }}>
            <EarthIcon className="h-24 w-24 text-primary" />
          </motion.div>

          <motion.div className="absolute right-[15%] top-[30%] opacity-20" style={{ x: x2, y: y2 }}>
            <Compass className="h-20 w-20 text-primary" />
          </motion.div>

          <motion.div className="absolute bottom-[25%] left-[20%] opacity-20" style={{ x: x2, y: y1 }}>
            <MapPin className="h-16 w-16 text-primary" />
          </motion.div>

          <motion.div className="absolute bottom-[20%] right-[10%] opacity-20" style={{ x: x1, y: y2 }}>
            <Globe className="h-28 w-28 text-primary" />
          </motion.div>
        </div>

        {/* Gradient Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t bg-secondary/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">{t("howItWorks")}</h2>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Three simple steps to discover your perfect travel preferences
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Camera,
                title: t("uploadImages"),
                description: t("uploadImagesDesc"),
              },
              {
                icon: Compass,
                title: t("aiAnalysis"),
                description: t("aiAnalysisDesc"),
              },
              {
                icon: Map,
                title: t("getResults"),
                description: t("getResultsDesc"),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}
