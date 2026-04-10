"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plane, Menu, X, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/contexts/auth-context"
import { useMultiplayer } from "@/contexts/multiplayer-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { sessionId } = useMultiplayer()

  const allNavItems = [
    { name: t("home"), href: "/" },
    { name: t("upload"), href: "/upload" },
    { name: t("about"), href: "/about" },
    { name: t("contact"), href: "/contact" },
  ]

  // Show upload only in multiplayer sessions or single mode
  const isInSingleMode = pathname.startsWith('/single')
  const navItems = allNavItems.filter(item => {
    if (item.href === "/upload" && !sessionId && !isInSingleMode) {
      return false
    }
    return true
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300",
        isScrolled ? "border-border/40 bg-background/80 shadow-lg" : "border-transparent bg-background/50",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-6 w-6" />
          </div>
          <span className="hidden font-bold sm:inline-block">{t("Ai Trip Planner")}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn("relative transition-all", pathname === item.href && "shadow-lg shadow-primary/30")}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  window.location.href = '/'
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth">Login</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden"
        >
          <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
