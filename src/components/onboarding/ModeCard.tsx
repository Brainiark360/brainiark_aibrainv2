"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModeCardProps {
  mode: {
    id: string
    title: string
    description: string
    icon: LucideIcon
    color: string // gradient e.g. "from-blue-500 to-cyan-400"
    recommended?: boolean
  }
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}

export default function ModeCard({
  mode,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: ModeCardProps) {
  const Icon = mode.icon

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative w-full rounded-2xl p-6 flex flex-col gap-4 text-left select-none",
        "transition-colors outline-none",
        "border bg-[rgb(var(--os-surface))] backdrop-blur-sm",
        isSelected
          ? "border-[rgb(var(--os-accent))] bg-[rgb(var(--os-surface))/0.6]"
          : isHovered
          ? "border-[rgb(var(--os-accent))/0.3] bg-[rgb(var(--os-surface))/0.4]"
          : "border-[rgb(var(--border))]"
      )}
      style={{
        minHeight: "170px",
      }}
    >
      {/* SELECTED GLOW EFFECT */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="glow"
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0px rgba(var(--os-accent), 0)",
                "0 0 14px rgba(var(--os-accent), 0.35)",
                "0 0 0px rgba(var(--os-accent), 0)",
              ],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </AnimatePresence>

      {/* CHECKMARK INDICATOR */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[rgb(var(--os-accent))] flex items-center justify-center shadow-md"
          >
            <Check className="h-3.5 w-3.5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECOMMENDED BADGE */}
      {mode.recommended && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-medium 
                     text-white bg-[rgb(var(--os-accent))] shadow-sm shadow-[rgb(var(--os-accent))/0.6]"
        >
          Recommended
        </motion.div>
      )}

      {/* ICON CONTAINER */}
      <motion.div
        className={cn(
          "h-14 w-14 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm",
          "bg-gradient-to-br opacity-[0.25]",
          mode.color,
          isSelected
            ? "opacity-40 border-[rgb(var(--os-accent))/0.4] bg-[rgb(var(--os-accent))/0.2]"
            : isHovered
            ? "opacity-[0.35]"
            : ""
        )}
        animate={{
          scale: isHovered || isSelected ? 1.05 : 1,
        }}
        transition={{ duration: 0.25 }}
      >
        <Icon className="h-6 w-6 text-[rgb(var(--foreground))]" />
      </motion.div>

      {/* TEXT BLOCK */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">
          {mode.title}
        </h3>

        <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
          {mode.description}
        </p>
      </div>

      {/* FOCUS RING */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none ring-offset-2 ring-offset-[rgb(var(--os-surface))] 
                   focus-visible:ring-2 focus-visible:ring-[rgb(var(--os-accent))]"
      ></span>
    </motion.button>
  )
}
