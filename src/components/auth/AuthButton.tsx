"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  loading?: boolean
}

const AuthButton = forwardRef<HTMLButtonElement, Props>(
  ({ icon: Icon, loading, children, className, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        className={cn(
          "w-full rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2",
          "transition-all bg-blue-600 text-white hover:bg-blue-700",
          "disabled:bg-blue-400 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        {children}
      </motion.button>
    )
  }
)

AuthButton.displayName = "AuthButton"
export default AuthButton
