"use client"

import { InputHTMLAttributes, forwardRef, useState } from "react"
import { LucideIcon, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
  loading?: boolean
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, loading, type, className, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === "password"

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-medium text-[rgb(var(--foreground))] tracking-wide">
            {label}
          </label>
        )}

        <div className="relative group">

          {/* Left icon */}
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          )}

          <input
            ref={ref}
            type={isPassword ? (show ? "text" : "password") : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
            className={cn(
              "w-full rounded-lg border bg-[rgb(var(--os-surface))] px-3 py-2.5 text-sm outline-none transition-all",
              "placeholder:text-[rgb(var(--muted-foreground))]/70",
              "focus:border-[rgb(var(--os-accent))] focus:ring-2 focus:ring-[rgb(var(--os-accent))/0.25]",
              Icon && "pl-10",
              error &&
                "border-red-500 focus:ring-red-300 focus:border-red-500 animate-shake",
              className
            )}
            {...props}
          />

          {/* Show/hide password */}
          {isPassword && !loading && (
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {/* Inline spinner inside input */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-[rgb(var(--os-accent))] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <p id={`${props.name}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"
export default AuthInput
