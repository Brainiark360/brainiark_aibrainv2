// /src/components/onboarding/EvidenceIntakePanel.tsx
"use client"

import { EvidenceInputFields } from "./EvidenceInputFields"
import { AnimatedGradientPanel } from "@/components/ui/AnimatedGradientPanel"
import { AIThinkingPanel } from "./AIThinkingPanel"
import { EvidenceMode } from "@/types/onboarding"
import { useState } from "react"
import AuthButton from "../auth/AuthButton"

interface EvidenceIntakePanelProps {
  brandId: string
  mode: EvidenceMode
}

export function EvidenceIntakePanel({ brandId, mode }: EvidenceIntakePanelProps) {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [socialLinks, setSocialLinks] = useState<string[]>([])
  const [manualText, setManualText] = useState("")

  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<"idle" | "sending" | "analyzing" | "done">("idle")
  const [progress, setProgress] = useState(0)

  const aiMessages = [
    "Reading your evidence...",
    "Extracting messaging cues...",
    "Understanding brand tone & audience signals...",
    "Structuring into your Brand Brain...",
  ]

  const handleSubmit = async () => {
    setLoading(true)
    setPhase("sending")
    setProgress(25)

    const payload = {
      brandId,
      mode,
      websiteUrl,
      manualText,
      socialLinks,
    }

    await fetch("/api/onboarding/analyze-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setPhase("analyzing")
    setProgress(75)

    setTimeout(() => {
      setPhase("done")
      setProgress(100)
    }, 2000)

    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* LEFT — Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <h2 className="text-sm font-semibold">Provide evidence</h2>

        <EvidenceInputFields
          mode={mode}
          websiteUrl={websiteUrl}
          socialLinks={socialLinks}
          manualText={manualText}
          onWebsiteChange={setWebsiteUrl}
          onAddSocial={(link) => setSocialLinks([...socialLinks, link])}
          onRemoveSocial={(i) =>
            setSocialLinks(socialLinks.filter((_, idx) => idx !== i))
          }
          onManualChange={setManualText}
        />

        <AuthButton loading={loading} onClick={handleSubmit}>
          Analyze Evidence
        </AuthButton>

        {(phase !== "idle") && (
          <div className="h-1.5 w-full rounded-full bg-[rgb(var(--muted))] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* CENTER — Animated Visual */}
      <div className="lg:col-span-4">
        <AnimatedGradientPanel className="h-full min-h-[280px]" />
      </div>

      {/* RIGHT — AI Streaming Panel */}
      <div className="lg:col-span-4">
        <AIThinkingPanel
          active={phase === "sending" || phase === "analyzing"}
          done={phase === "done"}
          messages={aiMessages}
        />
      </div>
    </div>
  )
}
