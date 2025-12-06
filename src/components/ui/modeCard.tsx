// /src/components/ui/Card.tsx
"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm hover:shadow-md",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
