"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface AuthWindowProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AuthWindow({ title, subtitle, children }: AuthWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        os-window 
        w-full 
        max-w-md 
        mx-auto 
        shadow-xl 
        backdrop-blur-xl 
        rounded-xl
      "
    >
      {/* Header */}
      <div
        className="
          os-window-header 
          pb-4
        "
      >
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed max-w-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="
          os-window-content 
          pt-6 pb-6 
          space-y-6
        "
      >
        {children}
      </div>
    </motion.div>
  )
}
