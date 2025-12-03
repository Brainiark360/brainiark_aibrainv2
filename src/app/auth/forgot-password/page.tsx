"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import AuthWindow from '@/components/auth/AuthWindow'
import AuthInput from '@/components/auth/AuthInput'
import AuthButton from '@/components/auth/AuthButton'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    
    // Mock password reset - replace with real API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1000)
  }

  return (
    <AuthWindow
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
    >
      {isSent ? (
        <div className="space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-green-500" />
          </div>
          
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            We've sent a password reset link to{' '}
            <span className="font-medium">{email}</span>.
            Click the link to reset your password.
          </p>
          
          <div className="space-y-3 pt-4">
            <AuthButton
              onClick={() => router.push('/auth/login')}
              variant="outline"
            >
              Back to Sign In
            </AuthButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </p>
          
          <AuthInput
            type="email"
            label="Email"
            icon={Mail}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="space-y-3">
            <AuthButton
              type="submit"
              icon={Send}
              loading={isLoading}
              disabled={!email}
            >
              Send Reset Link
            </AuthButton>
            
            <Link href="/auth/login">
              <AuthButton variant="outline" icon={ArrowLeft}>
                Back to Sign In
              </AuthButton>
            </Link>
          </div>
        </form>
      )}
    </AuthWindow>
  )
}