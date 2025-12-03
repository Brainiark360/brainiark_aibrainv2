"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, UserPlus } from "lucide-react"
import AuthWindow from "@/components/auth/AuthWindow"
import AuthInput from "@/components/auth/AuthInput"
import AuthButton from "@/components/auth/AuthButton"
import AuthError from "@/components/auth/AuthError"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        setIsLoading(false)
        return
      }

      router.push("/onboarding?mode=first-time")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthWindow title="Create Account" subtitle="Start your Brainiark OS journey">
      <form onSubmit={handleSubmit} className="space-y-6">

        {error && <AuthError message={error} />}

        <AuthInput
          name="name"
          type="text"
          label="Name"
          icon={User}
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <AuthInput
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="you@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={error?.includes("Email") ? error : undefined}
          required
        />

        <AuthInput
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          minLength={8}
        />

        <AuthButton
          type="submit"
          icon={UserPlus}
          loading={isLoading}
          disabled={!formData.name || !formData.email || !formData.password}
        >
          Create Account
        </AuthButton>

        <div className="text-center text-xs text-[rgb(var(--muted-foreground))]">
          Already have an account?
          <Link href="/auth/login" className="ml-1 text-[rgb(var(--os-accent))]">
            Sign In
          </Link>
        </div>
      </form>
    </AuthWindow>
  )
}
