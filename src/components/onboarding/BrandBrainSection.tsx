// /src/components/onboarding/BrandBrainSection.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BrandBrainSectionDTO, BrainSectionKey } from "@/types/brand-brain"
import { InlineEditor } from "./InlineEditor"

interface BrandBrainSectionProps {
  section: BrandBrainSectionDTO
  brandId: string
  index: number
}

interface UpdateResponse {
  success: boolean
  error?: string
}

export function BrandBrainSection({
  section,
  brandId,
  index,
}: BrandBrainSectionProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(section.content)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (value: string) => {
    setError(null)

    const payload = {
      brandId,
      sectionKey: section.key as BrainSectionKey,
      content: value,
    }

    const response = await fetch("/api/brand-brain/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as UpdateResponse

    if (!data.success) {
      setError(data.error ?? "Failed to update section.")
      throw new Error(data.error ?? "Update failed")
    }

    setContent(value)
    setEditing(false)
  }

  const handleCancel = () => {
    setError(null)
    setEditing(false)
  }

  const handleAfterRegenerate = (value: string) => {
    // Just update local editor value; save happens when pressing Save
    setError(null)
    setContent(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 sm:p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{section.title}</h3>
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[rgb(var(--muted-foreground))]">
            {section.key}
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {editing ? (
        <InlineEditor
          initialValue={content}
          onSave={handleSave}
          onCancel={handleCancel}
          onAfterRegenerate={handleAfterRegenerate}
        />
      ) : (
        <div className="text-sm text-[rgb(var(--muted-foreground))] whitespace-pre-wrap">
          {content && content.trim().length > 0 ? (
            content
          ) : (
            <span className="text-xs italic text-[rgb(var(--muted-foreground))]">
              This section hasn’t been drafted yet. Provide evidence and let AI
              help you shape it.
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
