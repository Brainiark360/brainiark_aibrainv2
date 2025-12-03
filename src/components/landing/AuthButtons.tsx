"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface AuthButtonProps {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AuthButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}: AuthButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const baseClasses = "inline-flex items-center justify-center rounded-md transition-all"
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  const variantClasses = {
    primary: "bg-[rgb(var(--foreground))] text-[rgb(var(--background))] hover:opacity-90",
    outline: "border border-[rgb(var(--border))] hover:bg-[rgb(var(--accent))]",
    ghost: "hover:bg-[rgb(var(--accent))]"
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
        <motion.div
          animate={{ rotate: isHovered ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="ml-2 h-4 w-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--os-surface-elevated))] shadow-lg z-50"
        >
          <div className="py-1">
            <Link
              href="/auth/login"
              className="flex items-center px-4 py-3 text-sm hover:bg-[rgb(var(--accent))] transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <LogIn className="h-4 w-4 mr-3" />
              <div>
                <div className="font-medium">Sign In</div>
                <div className="text-xs text-[rgb(var(--muted-foreground))]">Existing accounts</div>
              </div>
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center px-4 py-3 text-sm hover:bg-[rgb(var(--accent))] transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <UserPlus className="h-4 w-4 mr-3" />
              <div>
                <div className="font-medium">Create Account</div>
                <div className="text-xs text-[rgb(var(--muted-foreground))]">New to Brainiark</div>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Standalone Sign Up Button
export function SignUpButton({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  return (
    <Link
      href="/auth/signup"
      className={`inline-flex items-center justify-center rounded-md bg-[rgb(var(--foreground))] text-[rgb(var(--background))] hover:opacity-90 transition-all ${className} ${
        size === 'sm' ? 'px-3 py-1.5 text-sm' :
        size === 'lg' ? 'px-6 py-3 text-base' :
        'px-4 py-2 text-sm'
      }`}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Create Account
    </Link>
  )
}