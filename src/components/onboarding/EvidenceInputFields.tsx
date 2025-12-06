// /src/components/onboarding/EvidenceInputFields.tsx
"use client"

import { EvidenceMode } from "@/types/onboarding"
import { EvidenceChip } from "./EvidenceChip"
import { useState } from "react"
import AuthInput from "../auth/AuthInput"

interface EvidenceInputFieldsProps {
  mode: EvidenceMode
  websiteUrl: string
  socialLinks: string[]
  manualText: string
  onWebsiteChange: (v: string) => void
  onAddSocial: (v: string) => void
  onRemoveSocial: (i: number) => void
  onManualChange: (v: string) => void
}

export function EvidenceInputFields({
  mode,
  websiteUrl,
  socialLinks,
  manualText,
  onWebsiteChange,
  onAddSocial,
  onRemoveSocial,
  onManualChange,
}: EvidenceInputFieldsProps) {
  const [socialDraft, setSocialDraft] = useState("")

  return (
    <div className="space-y-6">
      {/* WEBSITE MODE */}
      {(mode === "website" || mode === "hybrid") && (
        <AuthInput
          label="Website URL"
          placeholder="https://yourbrand.com"
          value={websiteUrl}
          onChange={(e) => onWebsiteChange(e.target.value)}
        />
      )}

      {/* SOCIAL MODE */}
      {(mode === "social" || mode === "hybrid") && (
        <div className="space-y-2">
          <AuthInput
            label="Social Link"
            placeholder="https://twitter.com/yourbrand"
            value={socialDraft}
            onChange={(e) => setSocialDraft(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (socialDraft.trim().length > 0) {
                onAddSocial(socialDraft)
                setSocialDraft("")
              }
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Add Social Link
          </button>

          <div className="flex flex-wrap gap-2 pt-2">
            {socialLinks.map((link, i) => (
              <EvidenceChip key={i} label={link} onRemove={() => onRemoveSocial(i)} />
            ))}
          </div>
        </div>
      )}

      {/* MANUAL MODE */}
      {(mode === "manual" || mode === "hybrid") && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-[rgb(var(--foreground))]">
            Describe your brand
          </label>
          <textarea
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-sm min-h-[120px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Tell us anything useful — voice, audience, mission, story..."
            value={manualText}
            onChange={(e) => onManualChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
