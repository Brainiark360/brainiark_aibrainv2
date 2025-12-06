"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

export default function AuthWindow({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        bg-[rgb(var(--card))]
        border border-[rgb(var(--border))]
        shadow-xl shadow-black/10
        rounded-2xl
        p-8
        space-y-6
        backdrop-blur-xl
      "
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">{subtitle}</p>
        )}
      </div>

      <div className="space-y-6">{children}</div>
    </motion.div>
  )
}
