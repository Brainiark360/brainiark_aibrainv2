"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Check, ArrowLeft } from 'lucide-react'
import AuthWindow from '@/components/auth/AuthWindow'
import AuthInput from '@/components/auth/AuthInput'
import AuthButton from '@/components/auth/AuthButton'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setIsLoading(true)
    
    // Mock password reset - replace with real API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      
      // Auto-redirect to login after success
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <AuthWindow
      title="Set New Password"
      subtitle="Choose a new password for your account"
    >
      {isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <h3 className="text-lg font-semibold">Password Updated</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Your password has been successfully reset. Redirecting to sign in...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {!token && (
            <div className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              Invalid or expired reset link. Please request a new one.
            </div>
          )}
          
          {token && (
            <>
              <AuthInput
                name="password"
                type="password"
                label="New Password"
                icon={Lock}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              
              <AuthInput
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                icon={Lock}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              
              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                <AuthButton
                  type="submit"
                  loading={isLoading}
                  disabled={!formData.password || !formData.confirmPassword}
                >
                  Set New Password
                </AuthButton>
                
                <Link href="/auth/login">
                  <AuthButton variant="outline" icon={ArrowLeft}>
                    Back to Sign In
                  </AuthButton>
                </Link>
              </div>
            </>
          )}
        </form>
      )}
    </AuthWindow>
  )
}