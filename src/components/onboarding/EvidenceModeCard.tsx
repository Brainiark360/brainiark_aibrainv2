// /src/components/onboarding/EvidenceModeCard.tsx
"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { type ReactNode } from "react"

interface EvidenceModeCardProps {
  mode: string
  title: string
  description: string
  icon: ReactNode
  brandId: string
}

export function EvidenceModeCard({
  mode,
  title,
  description,
  icon,
  brandId,
}: EvidenceModeCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/onboarding/evidence-intake?brandId=${brandId}&mode=${mode}`)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "group w-full text-left rounded-xl border border-[rgb(var(--border))] p-6",
        "bg-[rgb(var(--card))] shadow-sm hover:shadow-md transition-all",
        "flex flex-col justify-between h-48 cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          {description}
        </p>
      </div>
    </motion.button>
  )
}
