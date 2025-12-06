// /src/components/ui/AnimatedGradientPanel.tsx
"use client"

import { motion } from "framer-motion"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function AnimatedGradientPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--background))]",
        "shadow-[0_18px_40px_rgba(15,23,42,0.18)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-400/25 animate-gradient-shift" />
      <div className="absolute inset-0 bg-noise opacity-[0.12] mix-blend-soft-light" />
      <div className="relative p-4 sm:p-6">
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          AI workspace initialization in progress…
        </p>
      </div>
    </motion.div>
  )
}
