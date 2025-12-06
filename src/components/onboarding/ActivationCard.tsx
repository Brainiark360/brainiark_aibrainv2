// /src/components/onboarding/ActivationCard.tsx
"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import AuthButton from "../auth/AuthButton"

interface ActivationCardProps {
  brandId: string
  brandName: string
}

export function ActivationCard({ brandId, brandName }: ActivationCardProps) {
  const router = useRouter()

  const handleGoToWorkspace = () => {
    router.push(`/workspace/${brandId}`)
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold">
            {brandName} is ready.
          </h3>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Your Brand Brain is in place. You’re set to begin creating content with
            intelligence.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <AuthButton type="button" onClick={handleGoToWorkspace}>
          Go to workspace
        </AuthButton>
      </div>
    </div>
  )
}

