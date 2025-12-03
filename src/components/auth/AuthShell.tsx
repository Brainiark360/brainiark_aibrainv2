"use client"

import { motion } from "framer-motion"
import { Brain } from "lucide-react"
import { ThemeToggle } from "../theme/theme-toggle"

interface AuthShellProps {
  children: React.ReactNode
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[rgb(var(--background))] overflow-hidden">

      {/* --- Subtle Professional Background Layers --- */}

      {/* Soft radial center glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(120,120,255,0.06),transparent_70%)]" />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12),transparent_20%,transparent_80%,rgba(0,0,0,0.15))]" />

      {/* Ultra subtle neural texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[url('/textures/noise-light.png')] bg-repeat"></div>

      {/* ---------------- Header ---------------- */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          fixed top-0 left-0 right-0 z-40
          border-b border-[rgb(var(--border))/0.4]
          bg-[rgb(var(--os-surface))/0.7]
          backdrop-blur-xl
        "
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2 select-none">
              <div
                className="
                  h-9 w-9 rounded-lg 
                  bg-gradient-to-br 
                  from-[rgb(var(--os-accent))] 
                  to-purple-600/70
                  flex items-center justify-center shadow-md shadow-black/20
                "
              >
                <Brain className="h-5 w-5 text-white" />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-base sm:text-lg font-semibold tracking-tight">
                  Brainiark
                </span>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  OS
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* ---------------- Main Auth Window ---------------- */}
      <main className="w-full max-w-md z-10 mt-24 sm:mt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="
            bg-[rgb(var(--os-surface))]/90 
            border border-[rgb(var(--border))] 
            backdrop-blur-xl 
            rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]
            p-8
          "
        >
          {children}
        </motion.div>
      </main>

      {/* ---------------- Footer ---------------- */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
        className="fixed bottom-6 sm:bottom-8 text-center px-4"
      >
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          Brainiark OS • Strategy-First Content Platform
        </p>
      </motion.footer>
    </div>
  )
}
