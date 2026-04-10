"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Brain, ImageIcon, Sparkles, Users, Target, Rocket } from "lucide-react"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"

export default function AboutPage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced vision models analyze your travel photos to understand your preferences",
    },
    {
      icon: ImageIcon,
      title: "Image Recognition",
      description: "Sophisticated computer vision extracts meaningful patterns from your images",
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "LLM technology generates personalized travel suggestions based on your style",
    },
  ]

  const timeline = [
    {
      title: "Upload Images",
      description: "User uploads travel photos through our intuitive interface",
    },
    {
      title: "Vision Analysis",
      description: "AI vision model processes and analyzes image content",
    },
    {
      title: "Preference Extraction",
      description: "LLM extracts travel preferences and patterns from the analysis",
    },
    {
      title: "Results Generation",
      description: "Personalized recommendations are generated and displayed",
    },
  ]

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
              className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Rocket className="h-10 w-10" />
            </motion.div>

            <h1 className="mb-4 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">{t("aboutThisProject")}</h1>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              A graduation project combining AI, computer vision, and modern web technologies
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="overflow-hidden border-2 bg-gradient-to-br from-primary/10 via-card/50 to-card/50 p-10 backdrop-blur-sm">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Target className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold">{t("projectVision")}</h2>
              </div>
              <p className="mb-6 text-pretty text-lg leading-relaxed">
                The AI-Driven Visual Trip Planner revolutionizes travel planning by analyzing your visual preferences.
                By leveraging state-of-the-art vision models and large language models, we extract meaningful insights
                from your travel photos to understand your unique travel style.
              </p>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Built with Next.js, React, and modern UI frameworks, this project demonstrates the practical application
                of AI in solving real-world problems while maintaining a premium user experience.
              </p>
            </Card>
          </motion.div>

          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 text-center text-3xl font-bold"
            >
              {t("keyTechnologies")}
            </motion.h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Card className="h-full border-2 bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-pretty leading-relaxed text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-16"
          >
            <h2 className="mb-8 text-center text-3xl font-bold">How It Works</h2>
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-primary/20 lg:left-1/2" />

              <div className="space-y-8">
                {timeline.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className={`relative flex items-center gap-8 ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    <div className="hidden flex-1 lg:block" />

                    <div className="absolute left-8 flex h-4 w-4 items-center justify-center lg:left-1/2 lg:-translate-x-1/2">
                      <div className="h-4 w-4 rounded-full border-4 border-background bg-primary" />
                    </div>

                    <Card className="ml-16 flex-1 border-2 bg-card/50 p-6 backdrop-blur-sm lg:ml-0">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-pretty leading-relaxed text-muted-foreground">{step.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card className="border-2 bg-card/50 p-10 text-center backdrop-blur-sm">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-2xl font-bold">Built With Modern Technologies</h2>
              <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Next.js • React • TypeScript • TailwindCSS • Framer Motion • shadcn/ui • Lucide Icons
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
