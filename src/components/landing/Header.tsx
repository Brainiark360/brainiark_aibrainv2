"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import AuthButton, { SignUpButton } from "./AuthButtons"
import { ThemeToggle } from "../theme/theme-toggle"

const navigation = [
  { name: "Product", href: "#product" },
  { name: "Strategy", href: "#strategy" },
  { name: "AI Flow", href: "#ai-flow" },
  { name: "Brand Brain", href: "#brand-brain" },
  { name: "Features", href: "#features" }
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className="
        fixed top-0 z-50 w-full
        border-b border-[rgb(var(--os-border))]
        bg-[rgb(var(--os-surface))/0.75]
        backdrop-blur-md
        supports-[backdrop-filter]:bg-[rgb(var(--os-surface))/0.6]
      "
    >
      {/* Desktop Shell */}
      <nav
        className="
          mx-auto max-w-7xl 
          px-4 sm:px-6 lg:px-8
        "
        aria-label="Global"
      >
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className="
                h-8 w-8 rounded-md 
                bg-gradient-to-br 
                from-[rgb(var(--os-accent))] 
                to-[rgb(var(--os-accent))/0.7]
              "
            />
            <div className="flex items-baseline gap-1">
              <span
                className="text-xl font-semibold tracking-tight group-hover:opacity-90"
              >
                Brainiark
              </span>
              <span
                className="text-xs text-[rgb(var(--muted-foreground))] font-medium"
              >
                OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="
                  text-sm font-medium
                  text-[rgb(var(--muted-foreground))]
                  hover:text-[rgb(var(--foreground))]
                  transition-colors
                  tracking-tight
                "
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right Side Desktop */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              <AuthButton variant="ghost" />
              <SignUpButton />
            </div>

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="
                lg:hidden -m-2.5 p-2.5 rounded-md
                text-[rgb(var(--foreground))]
                hover:bg-[rgb(var(--accent))]
                transition-colors
              "
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="
                fixed inset-y-0 right-0 z-50 
                w-full max-w-sm
                bg-[rgb(var(--os-surface))]
                border-l border-[rgb(var(--os-border))]
                shadow-xl
                overflow-y-auto
              "
            >
              {/* Panel Header */}
              <div
                className="
                  flex items-center justify-between 
                  p-4 border-b border-[rgb(var(--border))]
                "
              >
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div
                    className="
                      h-8 w-8 rounded-md 
                      bg-gradient-to-br 
                      from-[rgb(var(--os-accent))] 
                      to-[rgb(var(--os-accent))/0.7]
                    "
                  />
                  <div className="flex flex-col leading-none">
                    <span className="text-lg font-semibold tracking-tight">
                      Brainiark
                    </span>
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      OS
                    </span>
                  </div>
                </Link>

                <button
                  className="
                    -m-2.5 p-2.5 rounded-md 
                    hover:bg-[rgb(var(--accent))]
                    transition-colors
                  "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links */}
              <div className="p-4 space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="
                      block px-3 py-3 rounded-lg 
                      text-base font-medium
                      text-[rgb(var(--foreground))]
                      hover:bg-[rgb(var(--accent))]
                      transition-colors
                    "
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 mx-4 h-px bg-[rgb(var(--border))]" />

              {/* Auth */}
              <div className="px-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Account
                </h3>

                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                      block w-full text-center 
                      px-4 py-3 rounded-lg 
                      border border-[rgb(var(--border))]
                      text-sm font-medium
                      hover:bg-[rgb(var(--accent))]
                      transition-colors
                    "
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                      block w-full text-center 
                      px-4 py-3 rounded-lg 
                      bg-[rgb(var(--foreground))]
                      text-[rgb(var(--background))]
                      text-sm font-medium
                      hover:opacity-90
                    "
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Footer Info */}
              <div className="px-4 mt-10 mb-6 text-xs text-[rgb(var(--muted-foreground))] space-y-1">
                <p>Brainiark OS v2.1</p>
                <p>Strategy-First Content Platform</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
