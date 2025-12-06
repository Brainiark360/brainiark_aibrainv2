"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import AuthWindow from "@/components/auth/AuthWindow"
import AuthError from "@/components/auth/AuthError"
import AuthInput from "@/components/auth/AuthInput"
import AuthButton from "@/components/auth/AuthButton"
import { registerSchema, type RegisterInput } from "@/lib/zod-schemas"

export default function RegisterPage() {
  const router = useRouter()

  const [values, setValues] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Frontend validation
    const parsed = registerSchema.safeParse(values)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (typeof path === 'string') {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      })

      const json = await res.json()
      
      console.log("[FRONTEND] Register response:", json)

      if (!json.success) {
        // Handle field-specific errors from backend
        if (json.errors && typeof json.errors === 'object') {
          setErrors(json.errors)
        } else {
          setErrors({ 
            form: json.error || json.firstError || "Registration failed" 
          })
        }
        setLoading(false)
        return
      }

      // Registration successful - redirect to onboarding
      console.log("[FRONTEND] Registration successful, redirecting to:", json.data.redirectTo)
      router.push(json.data.redirectTo)

    } catch (error: unknown) {
      console.error("[FRONTEND] Registration error:", error)
      setErrors({ 
        form: error instanceof Error ? error.message : "Network error. Please check your connection and try again." 
      })
      setLoading(false)
    }
  }

  const allValid = Boolean(
    values.firstName &&
    values.lastName &&
    values.email &&
    values.phone &&
    values.password
  )

  return (
    <AuthShell>
      <AuthWindow
        title="Create your Account"
        subtitle="You're just a step away from Brainiark."
      >
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {errors.form && <AuthError message={errors.form} />}

          <div className="grid grid-cols-2 gap-3">
            <AuthInput
              label="First Name"
              requiredLabel
              name="firstName"
              error={errors.firstName}
              value={values.firstName}
              onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
              placeholder="John"
            />

            <AuthInput
              label="Last Name"
              requiredLabel
              name="lastName"
              error={errors.lastName}
              value={values.lastName}
              onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>

          <AuthInput
            label="Email"
            requiredLabel
            name="email"
            type="email"
            error={errors.email}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="john@example.com"
          />

          <AuthInput
            label="Phone Number"
            requiredLabel
            name="phone"
            type="tel"
            error={errors.phone}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="+1 (123) 456-7890"
          />

          <AuthInput
            label="Password"
            requiredLabel
            name="password"
            type="password"
            error={errors.password}
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            placeholder="At least 8 characters"
          />

          <AuthButton loading={loading} disabled={!allValid || loading}>
            Create Account
          </AuthButton>

          <div className="text-xs text-[rgb(var(--muted-foreground))] text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="hover:underline">Log in</Link>
          </div>
        </form>
      </AuthWindow>
    </AuthShell>
  )
}