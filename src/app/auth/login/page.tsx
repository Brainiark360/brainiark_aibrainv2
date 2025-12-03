"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn } from 'lucide-react'
import AuthWindow from '@/components/auth/AuthWindow'
import AuthInput from '@/components/auth/AuthInput'
import AuthButton from '@/components/auth/AuthButton' // CORRECT IMPORT
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data.error)
        return
      }

      // Later, you can call /api/user/workspaces to decide where to route.
      // For now, assume onboarding route if onboarding not completed:
      if (!data.user.onboardingCompleted) {
        router.push("/onboarding?mode=first-time")
      } else {
        router.push("/app") // or workspace selector
      }
    } finally {
      setIsLoading(false)
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <AuthWindow
      title="Sign In"
      subtitle="Access your Brainiark OS workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <div className="space-y-4">
          <AuthInput
            name="password"
            type="password"
            label="Password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[rgb(var(--os-accent))] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <AuthButton
          type="submit"
          icon={LogIn}
          loading={isLoading}
          disabled={!formData.email || !formData.password}
        >
          Sign In
        </AuthButton>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgb(var(--border))]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[rgb(var(--os-surface))] px-2 text-[rgb(var(--muted-foreground))]">
              New to Brainiark?
            </span>
          </div>
        </div>
        
        <Link href="/auth/signup">
          <AuthButton variant="outline">
            Create Account
          </AuthButton>
        </Link>
      </form>
    </AuthWindow>
  )
}