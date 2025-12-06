// /src/components/onboarding/InlineEditor.tsx
"use client"

import { useState } from "react"
import { ThinkingIndicator } from "@/components/ui/ThinkingIndicator"
import { StreamingText } from "@/components/ui/StreamingText"
import AuthButton from "../auth/AuthButton"

interface InlineEditorProps {
  initialValue: string
  onSave: (value: string) => Promise<void>
  onCancel: () => void
  onAfterRegenerate?: (value: string) => void
}

type EditorPhase = "idle" | "saving" | "regenerating"

export function InlineEditor({
  initialValue,
  onSave,
  onCancel,
  onAfterRegenerate,
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [phase, setPhase] = useState<EditorPhase>("idle")
  const [error, setError] = useState<string | null>(null)

  const aiMessages = [
    "Reading existing section…",
    "Aligning with your brand evidence…",
    "Drafting a fresher, more focused version…",
  ]

  const handleSave = async () => {
    setError(null)
    setPhase("saving")
    try {
      await onSave(value)
    } catch (err) {
      console.error("[INLINE_EDITOR_SAVE_ERROR]", err)
      setError("Could not save this section. Please try again.")
    } finally {
      setPhase("idle")
    }
  }

  const handleRegenerate = async () => {
    setError(null)
    setPhase("regenerating")
    try {
      // Placeholder AI behavior — you can replace this with a real AI call later.
      const regenerated = value.length
        ? `${value}\n\n[AI refreshed draft — refine further as needed.]`
        : "[AI generated a starter draft based on your brand evidence.]"

      if (onAfterRegenerate) {
        onAfterRegenerate(regenerated)
      }
      setValue(regenerated)
    } catch (err) {
      console.error("[INLINE_EDITOR_REGENERATE_ERROR]", err)
      setError("AI couldn’t regenerate this section right now.")
    } finally {
      setPhase("idle")
    }
  }

  const isSaving = phase === "saving"
  const isRegenerating = phase === "regenerating"

  return (
    <div className="space-y-3">
      <textarea
        className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-sm min-h-[140px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-2 items-center">
        <AuthButton
          type="button"
          loading={isSaving}
          disabled={isSaving || !value.trim()}
          onClick={handleSave}
        >
          Save
        </AuthButton>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
          disabled={isSaving || isRegenerating}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleRegenerate}
          className="ml-auto text-xs text-blue-600 hover:text-blue-700"
          disabled={isSaving || isRegenerating}
        >
          Regenerate with AI
        </button>
      </div>

      {(isRegenerating || isSaving) && (
        <div className="space-y-1 pt-1">
          <ThinkingIndicator
            label={isRegenerating ? "Regenerating with AI…" : "Saving changes…"}
          />
          <StreamingText
            messages={aiMessages}
            active={isRegenerating}
            done={!isRegenerating}
          />
        </div>
      )}
    </div>
  )
}
