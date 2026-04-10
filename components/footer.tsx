"use client"

import { motion } from "framer-motion"
import { Plane, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t bg-secondary/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Plane className="h-6 w-6" />
              </div>
              <span className="font-bold">Trip Planner</span>
            </Link>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              AI-powered travel preference analysis for smarter trip planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upload" className="transition-colors hover:text-primary">
                  Upload
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="mb-4 font-semibold">Project</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Graduation Project {currentYear}</li>
              <li>AI & Computer Vision</li>
              <li>Next.js & React</li>
              <li>Modern UI/UX</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 font-semibold">Connect</h3>
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors hover:border-primary hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors hover:border-primary hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Graduation Project {currentYear} – All Rights Reserved</p>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  )
}
