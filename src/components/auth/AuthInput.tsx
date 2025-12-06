"use client"

import { InputHTMLAttributes, forwardRef, useState } from "react"
import { Eye, EyeOff, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
  requiredLabel?: boolean
}

const AuthInput = forwardRef<HTMLInputElement, Props>(
  ({ label, icon: Icon, error, requiredLabel, type, className, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === "password"

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-medium text-[rgb(var(--foreground))]/85">
            {label}
            {requiredLabel && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <Icon className="absolute left-3 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          )}

          <input
            ref={ref}
            type={isPassword ? (show ? "text" : "password") : type}
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm transition-all",
              "bg-[rgb(var(--background))] border-[rgb(var(--border))]",
              "focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500",
              Icon && "pl-10",
              error && "border-red-500 focus:ring-red-500/25",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"
export default AuthInput
