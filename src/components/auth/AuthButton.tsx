import { ButtonHTMLAttributes, forwardRef } from "react"
import { LucideIcon } from "lucide-react"

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
  icon?: LucideIcon
  loading?: boolean
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      variant = "primary",
      icon: Icon,
      loading,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      w-full rounded-lg px-4 py-2.5 text-sm font-medium
      flex items-center justify-center gap-2
      transition-all duration-200
      active:scale-[0.97]
      disabled:opacity-50 disabled:cursor-not-allowed
      select-none
    `

    const variantClasses = {
      primary: `
        bg-[rgb(var(--foreground))] 
        text-[rgb(var(--background))]
        shadow-sm shadow-black/10 dark:shadow-none
        hover:opacity-90
      `,
      secondary: `
        bg-[rgb(var(--accent))] 
        text-[rgb(var(--accent-foreground))]
        hover:bg-[rgb(var(--accent))/0.9]
      `,
      outline: `
        border border-[rgb(var(--border))]
        text-[rgb(var(--foreground))]
        hover:bg-[rgb(var(--accent))/0.6]
        hover:border-[rgb(var(--accent))]
        transition-colors
      `,
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4 text-current" />
        ) : null}

        {children}
      </button>
    )
  }
)

AuthButton.displayName = "AuthButton"

export default AuthButton
