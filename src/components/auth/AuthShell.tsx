"use client"

import { motion } from "framer-motion"
import { Brain } from "lucide-react"
import { ThemeToggle } from "../theme/theme-toggle"
import type { ReactNode, MouseEvent } from "react"

export default function AuthShell({ children }: { children: ReactNode }) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6
    e.currentTarget.style.setProperty("--tilt-x", `${y}deg`)
    e.currentTarget.style.setProperty("--tilt-y", `${-x}deg`)
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[rgb(var(--background))] relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Gradient wash */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#3C5AFD]/25 via-transparent to-[#6A5AF9]/30 animate-gradient-shift"
      />

      {/* Noise */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] bg-noise pointer-events-none"
      />

      {/* Floating particles */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
      >
        <div className="absolute top-1/3 left-10 h-2 w-2 bg-white/40 rounded-full blur-sm animate-pulse" />
        <div className="absolute bottom-1/3 right-10 h-2 w-2 bg-blue-300/40 rounded-full blur-sm animate-pulse" />
      </motion.div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 backdrop-blur-lg border-b border-[rgb(var(--border))]/40">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-[rgb(var(--foreground))]" />
          <span className="font-semibold tracking-tight">Brainiark</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main window */}
      <motion.div
        className="relative w-full max-w-md mt-24"
        style={{
          transformStyle: "preserve-3d",
          rotateX: "var(--tilt-x, 0deg)",
          rotateY: "var(--tilt-y, 0deg)",
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
